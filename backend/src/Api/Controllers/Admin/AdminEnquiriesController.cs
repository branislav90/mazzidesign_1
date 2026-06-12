using System.Text.Json;
using System.Text.Json.Nodes;
using Api.Contracts;
using Api.Services;
using Api.Validation;
using Domain.Entities;
using FluentValidation;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Admin;

[ApiController]
[Route("api/admin/enquiries")]
[Authorize(Roles = "Admin")]
public class AdminEnquiriesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValidator<EnquiryPatchRequest> _validator;
    private readonly MediaUrlBuilder _urls;

    public AdminEnquiriesController(
        AppDbContext db, IValidator<EnquiryPatchRequest> validator, MediaUrlBuilder urls)
    {
        _db = db;
        _validator = validator;
        _urls = urls;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, CancellationToken ct)
    {
        var query = _db.Enquiries.AsNoTracking().AsQueryable();
        if (!string.IsNullOrEmpty(status))
        {
            if (!WireEnums.TryParseEnquiryStatus(status, out var st))
            {
                return BadRequest(new ProblemDetails { Title = "status must be New, Seen, Quoted, Won or Lost." });
            }

            query = query.Where(e => e.Status == st);
        }

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new EnquirySummaryDto(
                e.Id, e.Reference, e.Status.ToString(), e.Category, e.ItemType,
                e.ContactName, e.ContactEmail, e.CreatedAt))
            .ToListAsync(ct);

        return Ok(new { items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var enquiry = await _db.Enquiries.AsNoTracking()
            .Include(e => e.SnapshotMedia)
            .SingleOrDefaultAsync(e => e.Id == id, ct);
        if (enquiry is null)
        {
            return NotFound(new ProblemDetails { Title = "Enquiry not found." });
        }

        var photoIds = (JsonSerializer.Deserialize<List<Guid>>(enquiry.PhotoIdsJson) ?? [])
            .ToList();
        List<MediaAsset> photoAssets = photoIds.Count > 0
            ? await _db.MediaAssets.AsNoTracking()
                .Where(m => photoIds.Contains(m.Id))
                .ToListAsync(ct)
            : [];

        // Keep the original upload order.
        var photos = photoIds
            .Select(pid => photoAssets.FirstOrDefault(m => m.Id == pid))
            .Where(m => m is not null)
            .Select(m => _urls.Build(m, enquiry.Locale)!)
            .ToList();

        return Ok(new
        {
            id = enquiry.Id,
            reference = enquiry.Reference,
            status = enquiry.Status.ToWire(),
            internalNotes = enquiry.InternalNotes,
            createdAt = enquiry.CreatedAt,
            category = enquiry.Category,
            itemType = enquiry.ItemType,
            shape = enquiry.Shape,
            dimensionsMm = JsonNode.Parse(enquiry.DimensionsMmJson),
            derived = JsonNode.Parse(enquiry.DerivedJson),
            material = JsonNode.Parse(enquiry.MaterialJson),
            extras = JsonNode.Parse(enquiry.ExtrasJson),
            contact = new
            {
                name = enquiry.ContactName,
                email = enquiry.ContactEmail,
                phone = enquiry.ContactPhone,
                town = enquiry.ContactTown,
            },
            timeframe = enquiry.Timeframe,
            notes = enquiry.Notes,
            locale = enquiry.Locale,
            snapshot = _urls.Build(enquiry.SnapshotMedia, enquiry.Locale, "3D snapshot"),
            photos,
        });
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Patch(Guid id, EnquiryPatchRequest request, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        var enquiry = await _db.Enquiries.SingleOrDefaultAsync(e => e.Id == id, ct);
        if (enquiry is null)
        {
            return NotFound(new ProblemDetails { Title = "Enquiry not found." });
        }

        if (request.Status is not null)
        {
            WireEnums.TryParseEnquiryStatus(request.Status, out var status);
            enquiry.Status = status;
        }

        if (request.InternalNotes is not null)
        {
            enquiry.InternalNotes = request.InternalNotes;
        }

        await _db.SaveChangesAsync(ct);

        return Ok(new
        {
            id = enquiry.Id,
            reference = enquiry.Reference,
            status = enquiry.Status.ToWire(),
            internalNotes = enquiry.InternalNotes,
        });
    }
}
