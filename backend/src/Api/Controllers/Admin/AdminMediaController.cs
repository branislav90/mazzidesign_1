using Api.Services;
using Domain.Entities;
using Infrastructure.Media;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Admin;

[ApiController]
[Route("api/admin/media")]
[Authorize(Roles = "Admin")]
public class AdminMediaController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly MediaProcessingService _media;
    private readonly MediaUrlBuilder _urls;

    public AdminMediaController(AppDbContext db, MediaProcessingService media, MediaUrlBuilder urls)
    {
        _db = db;
        _media = media;
        _urls = urls;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var assets = await _db.MediaAssets.AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        return Ok(new { items = assets.Select(ToDto).ToList() });
    }

    [HttpPost]
    [RequestSizeLimit(40 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 40 * 1024 * 1024)]
    public async Task<IActionResult> Upload([FromForm] List<IFormFile> files, CancellationToken ct)
    {
        var error = EnquiriesController.ValidateImageFiles(files, maxCount: 10);
        if (error is not null)
        {
            return BadRequest(new ProblemDetails { Title = error });
        }

        var created = new List<MediaAsset>();
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
            created.Add(asset);
        }

        await _db.SaveChangesAsync(ct);
        return Ok(new { items = created.Select(ToDto).ToList() });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var asset = await _db.MediaAssets.SingleOrDefaultAsync(m => m.Id == id, ct);
        if (asset is null)
        {
            return NotFound(new ProblemDetails { Title = "Media asset not found." });
        }

        var idText = id.ToString();
        var referenced =
            await _db.ProjectImages.AnyAsync(i => i.MediaAssetId == id, ct)
            || await _db.Projects.AnyAsync(p => p.CoverImageId == id, ct)
            || await _db.Enquiries.AnyAsync(e => e.SnapshotMediaId == id || e.PhotoIdsJson.Contains(idText), ct);

        if (referenced)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Media asset is referenced by a project image, cover image or enquiry and cannot be deleted.",
            });
        }

        _db.MediaAssets.Remove(asset);
        await _db.SaveChangesAsync(ct);
        _media.DeleteFiles(asset);

        return NoContent();
    }

    private object ToDto(MediaAsset m) => new
    {
        id = m.Id,
        fileName = m.FileName,
        contentType = m.ContentType,
        sizeBytes = m.SizeBytes,
        url = _urls.Url(m.PathLarge),
        thumbUrl = _urls.Url(m.PathThumb),
        mediumUrl = _urls.Url(m.PathMedium),
        originalUrl = _urls.Url(m.PathOriginal),
        altTextSl = m.AltTextSl,
        altTextEn = m.AltTextEn,
        createdAt = m.CreatedAt,
    };
}
