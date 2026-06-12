using System.Text.Json;
using Api.Contracts;
using Api.Services;
using Api.Validation;
using Domain.Entities;
using FluentValidation;
using Infrastructure.Email;
using Infrastructure.Media;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/enquiries")]
public class EnquiriesController : ControllerBase
{
    public const long MaxPhotoBytes = 5 * 1024 * 1024;
    public const int MaxPhotoCount = 3;
    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly AppDbContext _db;
    private readonly IValidator<EnquiryCreateRequest> _validator;
    private readonly MediaProcessingService _media;
    private readonly EnquiryEmailSender _email;
    private readonly MediaUrlBuilder _urls;
    private readonly ILogger<EnquiriesController> _logger;

    public EnquiriesController(
        AppDbContext db,
        IValidator<EnquiryCreateRequest> validator,
        MediaProcessingService media,
        EnquiryEmailSender email,
        MediaUrlBuilder urls,
        ILogger<EnquiriesController> logger)
    {
        _db = db;
        _validator = validator;
        _media = media;
        _email = email;
        _urls = urls;
        _logger = logger;
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("enquiries")]
    public async Task<IActionResult> Create(EnquiryCreateRequest request, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        // Snapshot: decode the data URL and store it through the media pipeline.
        byte[]? snapshotBytes = null;
        MediaAsset? snapshotAsset = null;
        if (!string.IsNullOrEmpty(request.SnapshotDataUrl))
        {
            var decoded = TryDecodeDataUrl(request.SnapshotDataUrl);
            if (decoded is null)
            {
                return BadRequest(new ProblemDetails { Title = "snapshotDataUrl is not a valid base64 image data URL." });
            }

            try
            {
                snapshotBytes = decoded.Value.Bytes;
                snapshotAsset = await _media.CreateAsync(
                    snapshotBytes, "snapshot.png", decoded.Value.ContentType, ct);
                _db.MediaAssets.Add(snapshotAsset);
            }
            catch (SixLabors.ImageSharp.ImageFormatException)
            {
                return BadRequest(new ProblemDetails { Title = "snapshotDataUrl does not contain a decodable image." });
            }
        }

        // Keep only photo ids that actually exist as media assets.
        List<Guid> photoIds = request.Photos is { Count: > 0 }
            ? await _db.MediaAssets
                .Where(m => request.Photos.Contains(m.Id))
                .Select(m => m.Id)
                .ToListAsync(ct)
            : [];

        var now = DateTime.UtcNow;
        var enquiry = new Enquiry
        {
            Id = Guid.NewGuid(),
            Reference = await NextReferenceAsync(now.Year, ct),
            Category = request.Category,
            ItemType = request.ItemType,
            Shape = request.Shape,
            DimensionsMmJson = JsonSerializer.Serialize(
                request.DimensionsMm ?? new Dictionary<string, double?>(), JsonOptions),
            DerivedJson = JsonSerializer.Serialize(
                request.Derived ?? new EnquiryDerivedDto(null, null, null), JsonOptions),
            MaterialJson = JsonSerializer.Serialize(
                request.Material ?? new EnquiryMaterialDto(null, null), JsonOptions),
            ExtrasJson = JsonSerializer.Serialize(request.Extras ?? [], JsonOptions),
            SnapshotMediaId = snapshotAsset?.Id,
            PhotoIdsJson = JsonSerializer.Serialize(photoIds.Select(id => id.ToString()), JsonOptions),
            ContactName = request.Contact!.Name,
            ContactEmail = request.Contact.Email,
            ContactPhone = request.Contact.Phone,
            ContactTown = request.Contact.Town,
            Timeframe = request.Timeframe,
            Notes = request.Notes,
            Locale = WireEnums.NormalizeLocale(request.Locale),
            Status = EnquiryStatus.New,
            CreatedAt = now,
        };

        _db.Enquiries.Add(enquiry);
        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            // Concurrent enquiry grabbed the same sequence number — retry once.
            enquiry.Reference = await NextReferenceAsync(now.Year, ct);
            await _db.SaveChangesAsync(ct);
        }

        // Email must never fail the enquiry; the sender logs and swallows SMTP errors.
        var (subject, html, rawJson) = EnquiryEmailComposer.Compose(
            enquiry.Reference, request, snapshotBytes is not null, photoIds.Count);
        await _email.SendAsync(subject, html, snapshotBytes, rawJson, CancellationToken.None);

        _logger.LogInformation("Enquiry {Reference} created.", enquiry.Reference);
        return Created($"/api/admin/enquiries/{enquiry.Id}", new { reference = enquiry.Reference });
    }

    [HttpPost("photos")]
    [AllowAnonymous]
    [EnableRateLimiting("enquiries")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 20 * 1024 * 1024)]
    public async Task<IActionResult> UploadPhotos([FromForm] List<IFormFile> files, CancellationToken ct)
    {
        var error = ValidateImageFiles(files, MaxPhotoCount);
        if (error is not null)
        {
            return BadRequest(new ProblemDetails { Title = error });
        }

        var items = new List<object>();
        foreach (var file in files)
        {
            await using var stream = file.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, ct);

            MediaAsset asset;
            try
            {
                asset = await _media.CreateAsync(ms.ToArray(), file.FileName, file.ContentType, ct);
            }
            catch (SixLabors.ImageSharp.ImageFormatException)
            {
                return BadRequest(new ProblemDetails { Title = $"File '{file.FileName}' is not a decodable image." });
            }

            _db.MediaAssets.Add(asset);
            items.Add(new { id = asset.Id, url = _urls.Url(asset.PathLarge) });
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { items });
    }

    internal static string? ValidateImageFiles(List<IFormFile>? files, int maxCount)
    {
        if (files is null || files.Count == 0)
        {
            return "At least one file is required (multipart field 'files').";
        }

        if (files.Count > maxCount)
        {
            return $"At most {maxCount} files are allowed.";
        }

        foreach (var file in files)
        {
            if (file.Length > MaxPhotoBytes)
            {
                return $"File '{file.FileName}' exceeds the 5 MB limit.";
            }

            if (!AllowedImageTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            {
                return $"File '{file.FileName}' has unsupported type '{file.ContentType}'. Allowed: image/jpeg, image/png, image/webp.";
            }
        }

        return null;
    }

    private async Task<string> NextReferenceAsync(int year, CancellationToken ct)
    {
        var prefix = ReferenceGenerator.Prefix(year);
        var last = await _db.Enquiries
            .Where(e => e.Reference.StartsWith(prefix))
            .OrderByDescending(e => e.Reference)
            .Select(e => e.Reference)
            .FirstOrDefaultAsync(ct);

        return ReferenceGenerator.Format(year, ReferenceGenerator.NextSequence(last, year));
    }

    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is SqlException { Number: 2601 or 2627 };

    private static (byte[] Bytes, string ContentType)? TryDecodeDataUrl(string dataUrl)
    {
        const string marker = ";base64,";
        if (!dataUrl.StartsWith("data:image/", StringComparison.Ordinal))
        {
            return null;
        }

        var idx = dataUrl.IndexOf(marker, StringComparison.Ordinal);
        if (idx < 0)
        {
            return null;
        }

        var contentType = dataUrl[5..idx];
        try
        {
            return (Convert.FromBase64String(dataUrl[(idx + marker.Length)..]), contentType);
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
