using System.Text.Json.Nodes;
using Api.Contracts;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContentController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>All published landing-page sections for a locale.</summary>
    [HttpGet("page")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPage([FromQuery] string? locale, CancellationToken ct)
    {
        var loc = WireEnums.NormalizeLocale(locale);
        var rows = await _db.PageSections.AsNoTracking()
            .Select(s => new { s.Key, Json = loc == "en" ? s.JsonEn : s.JsonSl })
            .ToListAsync(ct);

        var sections = new Dictionary<string, JsonNode?>();
        foreach (var row in rows)
        {
            sections[row.Key] = JsonNode.Parse(row.Json);
        }

        return Ok(new { sections });
    }
}
