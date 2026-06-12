using Api.Contracts;
using Api.Services;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly MediaUrlBuilder _urls;

    public ProjectsController(AppDbContext db, MediaUrlBuilder urls)
    {
        _db = db;
        _urls = urls;
    }

    /// <summary>Published projects, optionally filtered by category and featured flag.</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List(
        [FromQuery] string? locale,
        [FromQuery] string? category,
        [FromQuery] bool? featured,
        CancellationToken ct)
    {
        var loc = WireEnums.NormalizeLocale(locale);
        var query = _db.Projects.AsNoTracking()
            .Include(p => p.CoverImage)
            .Include(p => p.Images.OrderBy(i => i.SortOrder)).ThenInclude(i => i.MediaAsset)
            .Where(p => p.Status == ProjectStatus.Published);

        if (!string.IsNullOrEmpty(category))
        {
            if (!WireEnums.TryParseCategory(category, out var cat))
            {
                return NotFound(new ProblemDetails { Title = $"Unknown category '{category}'." });
            }

            query = query.Where(p => p.Category == cat);
        }

        if (featured is { } f)
        {
            query = query.Where(p => p.IsFeatured == f);
        }

        var projects = await query
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.Year)
            .ToListAsync(ct);

        return Ok(new { items = projects.Select(p => ToDto(p, loc)).ToList() });
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string? locale, CancellationToken ct)
    {
        var loc = WireEnums.NormalizeLocale(locale);
        var project = await _db.Projects.AsNoTracking()
            .Include(p => p.CoverImage)
            .Include(p => p.Images.OrderBy(i => i.SortOrder)).ThenInclude(i => i.MediaAsset)
            .SingleOrDefaultAsync(p => p.Slug == slug && p.Status == ProjectStatus.Published, ct);

        return project is null
            ? NotFound(new ProblemDetails { Title = "Project not found." })
            : Ok(ToDto(project, loc));
    }

    private ProjectDto ToDto(Project p, string locale) => new(
        p.Id,
        p.Slug,
        p.Category.ToWire(),
        locale == "en" ? p.TitleEn : p.TitleSl,
        locale == "en" ? p.DescriptionEn : p.DescriptionSl,
        p.Species.ToWire(),
        p.Town,
        p.Year,
        p.IsFeatured,
        _urls.Build(p.CoverImage, locale),
        p.Images
            .Where(i => i.MediaAsset is not null)
            .Select(i => _urls.Build(
                i.MediaAsset, locale,
                (locale == "en" ? i.CaptionEn : i.CaptionSl)
                    ?? (locale == "en" ? i.MediaAsset!.AltTextEn : i.MediaAsset!.AltTextSl)
                    ?? i.MediaAsset!.FileName)!)
            .ToList());
}
