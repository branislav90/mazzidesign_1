using System.Text.Json;
using System.Text.Json.Nodes;
using Api.Contracts;
using Api.Services;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);

    private readonly AppDbContext _db;
    private readonly MediaUrlBuilder _urls;

    public ContentController(AppDbContext db, MediaUrlBuilder urls)
    {
        _db = db;
        _urls = urls;
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

        await EnrichSectionImagesAsync(sections, loc, ct);

        return Ok(new { sections });
    }

    /// <summary>
    /// Sections store image references as MediaAsset ids (hero.imageId,
    /// rooms.items[].imageId, videoSection.coverImageId). Resolve them into
    /// embedded MediaRef objects (hero.image, items[].image, coverImage) so the
    /// frontend never needs a second lookup. Missing/deleted assets resolve to
    /// nothing — the frontend falls back to the procedural wood-grain placeholder.
    /// </summary>
    private async Task EnrichSectionImagesAsync(
        Dictionary<string, JsonNode?> sections, string locale, CancellationToken ct)
    {
        var targets = new List<(JsonObject Owner, string IdProp, string RefProp)>();

        if (sections.GetValueOrDefault("hero") is JsonObject hero)
        {
            targets.Add((hero, "imageId", "image"));
        }

        if (sections.GetValueOrDefault("videoSection") is JsonObject video)
        {
            targets.Add((video, "coverImageId", "coverImage"));
        }

        if (sections.GetValueOrDefault("rooms") is JsonObject rooms && rooms["items"] is JsonArray items)
        {
            foreach (var item in items)
            {
                if (item is JsonObject room)
                {
                    targets.Add((room, "imageId", "image"));
                }
            }
        }

        Guid? IdOf(JsonObject owner, string prop) =>
            owner[prop] is JsonValue v && v.TryGetValue<string>(out var s) && Guid.TryParse(s, out var g)
                ? g
                : null;

        var ids = targets.Select(t => IdOf(t.Owner, t.IdProp)).OfType<Guid>().Distinct().ToList();
        if (ids.Count == 0)
        {
            return;
        }

        var assets = await _db.MediaAssets.AsNoTracking()
            .Where(m => ids.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, ct);

        foreach (var (owner, idProp, refProp) in targets)
        {
            if (IdOf(owner, idProp) is { } id && assets.TryGetValue(id, out var asset))
            {
                owner[refProp] = JsonSerializer.SerializeToNode(_urls.Build(asset, locale), WebJson);
            }
        }
    }
}
