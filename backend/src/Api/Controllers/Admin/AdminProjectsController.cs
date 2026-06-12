using Api.Contracts;
using Api.Services;
using Api.Validation;
using Domain.Entities;
using FluentValidation;
using Infrastructure.Media;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.Admin;

[ApiController]
[Route("api/admin/projects")]
[Authorize(Roles = "Admin")]
public class AdminProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValidator<ProjectUpsertRequest> _validator;
    private readonly IValidator<ImageOrderRequest> _orderValidator;
    private readonly MediaProcessingService _media;
    private readonly MediaUrlBuilder _urls;
    private readonly FrontendRevalidator _revalidator;

    public AdminProjectsController(
        AppDbContext db,
        IValidator<ProjectUpsertRequest> validator,
        IValidator<ImageOrderRequest> orderValidator,
        MediaProcessingService media,
        MediaUrlBuilder urls,
        FrontendRevalidator revalidator)
    {
        _db = db;
        _validator = validator;
        _orderValidator = orderValidator;
        _media = media;
        _urls = urls;
        _revalidator = revalidator;
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status, [FromQuery] string? category, CancellationToken ct)
    {
        var query = _db.Projects.AsNoTracking()
            .Include(p => p.Images.OrderBy(i => i.SortOrder)).ThenInclude(i => i.MediaAsset)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            if (!WireEnums.TryParseStatus(status, out var st))
            {
                return BadRequest(new ProblemDetails { Title = "status must be Draft or Published." });
            }

            query = query.Where(p => p.Status == st);
        }

        if (!string.IsNullOrEmpty(category))
        {
            if (!WireEnums.TryParseCategory(category, out var cat))
            {
                return BadRequest(new ProblemDetails { Title = $"Unknown category '{category}'." });
            }

            query = query.Where(p => p.Category == cat);
        }

        var projects = await query
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.Year)
            .ToListAsync(ct);

        return Ok(new { items = projects.Select(ToDto).ToList() });
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProjectUpsertRequest request, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        if (await _db.Projects.AnyAsync(p => p.Slug == request.Slug, ct))
        {
            return Conflict(new ProblemDetails { Title = $"A project with slug '{request.Slug}' already exists." });
        }

        var project = new Project { Id = Guid.NewGuid() };
        Apply(project, request);
        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);

        if (project.Status == ProjectStatus.Published)
        {
            _revalidator.Trigger();
        }

        return CreatedAtAction(nameof(List), null, ToDto(project));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, ProjectUpsertRequest request, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        var project = await _db.Projects
            .Include(p => p.Images.OrderBy(i => i.SortOrder)).ThenInclude(i => i.MediaAsset)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
        {
            return NotFound(new ProblemDetails { Title = "Project not found." });
        }

        if (await _db.Projects.AnyAsync(p => p.Slug == request.Slug && p.Id != id, ct))
        {
            return Conflict(new ProblemDetails { Title = $"A project with slug '{request.Slug}' already exists." });
        }

        var wasPublished = project.Status == ProjectStatus.Published;
        Apply(project, request);
        await _db.SaveChangesAsync(ct);

        if (wasPublished || project.Status == ProjectStatus.Published)
        {
            _revalidator.Trigger();
        }

        return Ok(ToDto(project));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var project = await _db.Projects.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
        {
            return NotFound(new ProblemDetails { Title = "Project not found." });
        }

        var wasPublished = project.Status == ProjectStatus.Published;
        _db.Projects.Remove(project);
        await _db.SaveChangesAsync(ct);

        if (wasPublished)
        {
            _revalidator.Trigger();
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [RequestSizeLimit(40 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 40 * 1024 * 1024)]
    public async Task<IActionResult> UploadImages(
        Guid id, [FromForm] List<IFormFile> files, CancellationToken ct)
    {
        var project = await _db.Projects
            .Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
        {
            return NotFound(new ProblemDetails { Title = "Project not found." });
        }

        var error = EnquiriesController.ValidateImageFiles(files, maxCount: 10);
        if (error is not null)
        {
            return BadRequest(new ProblemDetails { Title = error });
        }

        var nextOrder = project.Images.Count == 0 ? 0 : project.Images.Max(i => i.SortOrder) + 1;
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
            project.Images.Add(new ProjectImage
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                MediaAssetId = asset.Id,
                MediaAsset = asset,
                SortOrder = nextOrder++,
            });
        }

        await _db.SaveChangesAsync(ct);

        if (project.Status == ProjectStatus.Published)
        {
            _revalidator.Trigger();
        }

        return Ok(new { items = project.Images.OrderBy(i => i.SortOrder).Select(ToImageDto).ToList() });
    }

    [HttpPatch("{id:guid}/images/order")]
    public async Task<IActionResult> ReorderImages(Guid id, ImageOrderRequest request, CancellationToken ct)
    {
        var validation = await _orderValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        var project = await _db.Projects
            .Include(p => p.Images).ThenInclude(i => i.MediaAsset)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
        {
            return NotFound(new ProblemDetails { Title = "Project not found." });
        }

        var byId = project.Images.ToDictionary(i => i.Id);
        var unknown = request.ImageIds.Where(imageId => !byId.ContainsKey(imageId)).ToList();
        if (unknown.Count > 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = $"Unknown image ids: {string.Join(", ", unknown)}.",
            });
        }

        var order = 0;
        foreach (var imageId in request.ImageIds)
        {
            byId[imageId].SortOrder = order++;
        }

        // Any images not mentioned keep their relative order after the reordered ones.
        foreach (var image in project.Images
                     .Where(i => !request.ImageIds.Contains(i.Id))
                     .OrderBy(i => i.SortOrder))
        {
            image.SortOrder = order++;
        }

        await _db.SaveChangesAsync(ct);

        if (project.Status == ProjectStatus.Published)
        {
            _revalidator.Trigger();
        }

        return Ok(new { items = project.Images.OrderBy(i => i.SortOrder).Select(ToImageDto).ToList() });
    }

    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imageId, CancellationToken ct)
    {
        var project = await _db.Projects
            .Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
        if (project is null)
        {
            return NotFound(new ProblemDetails { Title = "Project not found." });
        }

        var image = project.Images.SingleOrDefault(i => i.Id == imageId);
        if (image is null)
        {
            return NotFound(new ProblemDetails { Title = "Image not found on this project." });
        }

        _db.ProjectImages.Remove(image);
        await _db.SaveChangesAsync(ct);

        if (project.Status == ProjectStatus.Published)
        {
            _revalidator.Trigger();
        }

        return NoContent();
    }

    private static void Apply(Project project, ProjectUpsertRequest request)
    {
        WireEnums.TryParseCategory(request.Category, out var category);
        WireEnums.TryParseSpecies(request.Species, out var species);
        WireEnums.TryParseStatus(request.Status, out var status);

        project.Slug = request.Slug;
        project.Category = category;
        project.TitleSl = request.TitleSl;
        project.TitleEn = request.TitleEn;
        project.DescriptionSl = request.DescriptionSl;
        project.DescriptionEn = request.DescriptionEn;
        project.Species = species;
        project.Town = request.Town;
        project.Year = request.Year;
        project.SortOrder = request.SortOrder;
        project.IsFeatured = request.IsFeatured;
        project.Status = status;
        project.CoverImageId = request.CoverImageId;
    }

    private AdminProjectDto ToDto(Project p) => new(
        p.Id,
        p.Slug,
        p.Category.ToWire(),
        p.TitleSl,
        p.TitleEn,
        p.DescriptionSl,
        p.DescriptionEn,
        p.Species.ToWire(),
        p.Town,
        p.Year,
        p.SortOrder,
        p.IsFeatured,
        p.Status.ToWire(),
        p.CoverImageId,
        p.Images.OrderBy(i => i.SortOrder).Select(ToImageDto).ToList());

    private AdminProjectImageDto ToImageDto(ProjectImage i) => new(
        i.Id,
        i.MediaAssetId,
        i.SortOrder,
        i.CaptionSl,
        i.CaptionEn,
        i.MediaAsset is null ? string.Empty : _urls.Url(i.MediaAsset.PathLarge),
        i.MediaAsset is null ? string.Empty : _urls.Url(i.MediaAsset.PathThumb),
        i.MediaAsset is null ? string.Empty : _urls.Url(i.MediaAsset.PathMedium));
}
