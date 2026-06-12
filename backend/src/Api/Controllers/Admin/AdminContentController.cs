using Api.Content;
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
[Route("api/admin/content")]
[Authorize(Roles = "Admin")]
public class AdminContentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValidator<ContentPutRequest> _validator;
    private readonly FrontendRevalidator _revalidator;

    public AdminContentController(
        AppDbContext db,
        IValidator<ContentPutRequest> validator,
        FrontendRevalidator revalidator)
    {
        _db = db;
        _validator = validator;
        _revalidator = revalidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var items = await _db.PageSections.AsNoTracking()
            .OrderBy(s => s.Key)
            .Select(s => new ContentItemDto(s.Key, s.JsonSl, s.JsonEn, s.UpdatedAt))
            .ToListAsync(ct);

        return Ok(new { items });
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> Put(string key, ContentPutRequest request, CancellationToken ct)
    {
        if (!SectionSchemas.IsKnownKey(key))
        {
            return NotFound(new ProblemDetails { Title = $"Unknown section key '{key}'." });
        }

        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return validation.ToProblem();
        }

        var errors = new Dictionary<string, string[]>();
        var slErrors = SectionSchemas.Validate(key, request.JsonSl);
        if (slErrors.Count > 0)
        {
            errors["jsonSl"] = slErrors.ToArray();
        }

        var enErrors = SectionSchemas.Validate(key, request.JsonEn);
        if (enErrors.Count > 0)
        {
            errors["jsonEn"] = enErrors.ToArray();
        }

        if (errors.Count > 0)
        {
            return ValidationProblem(new ValidationProblemDetails(errors)
            {
                Title = $"Section JSON does not match the '{key}' schema.",
            });
        }

        var section = await _db.PageSections.SingleOrDefaultAsync(s => s.Key == key, ct);
        if (section is null)
        {
            section = new PageSection { Id = Guid.NewGuid(), Key = key };
            _db.PageSections.Add(section);
        }

        section.JsonSl = request.JsonSl;
        section.JsonEn = request.JsonEn;
        section.UpdatedAt = DateTime.UtcNow;
        section.UpdatedBy = User.Identity?.Name ?? User.FindFirst("email")?.Value ?? "admin";
        await _db.SaveChangesAsync(ct);

        _revalidator.Trigger();
        return Ok(new ContentItemDto(section.Key, section.JsonSl, section.JsonEn, section.UpdatedAt));
    }
}
