using System.Text.Json;
using System.Text.Json.Nodes;

namespace Api.Content;

/// <summary>
/// Per-key validation of PageSection JSON against the shapes defined in docs/API-CONTRACT.md.
/// Unknown section keys are rejected outright.
/// </summary>
public static class SectionSchemas
{
    public static readonly string[] Keys =
    [
        "hero", "statement", "rooms", "gallery", "videoSection",
        "testimonial", "stats", "contact", "socialLinks", "seo",
    ];

    private static readonly string[] SpeciesValues = ["oak", "walnut", "ash", "smoked_oak", "other"];

    public static bool IsKnownKey(string key) => Keys.Contains(key);

    public static IReadOnlyList<string> Validate(string key, string json)
    {
        if (!IsKnownKey(key))
        {
            return [$"Unknown section key '{key}'."];
        }

        JsonNode? node;
        try
        {
            node = JsonNode.Parse(json);
        }
        catch (JsonException)
        {
            return ["Value is not valid JSON."];
        }

        if (node is not JsonObject obj)
        {
            return ["Root must be a JSON object."];
        }

        var errors = new List<string>();
        switch (key)
        {
            case "hero":
                RequireString(obj, "label", errors);
                RequireString(obj, "sub", errors);
                if (RequireArray(obj, "titleLines", errors) is { } lines)
                {
                    for (var i = 0; i < lines.Count; i++)
                    {
                        if (lines[i] is not JsonObject line)
                        {
                            errors.Add($"titleLines[{i}] must be an object.");
                            continue;
                        }

                        RequireString(line, "text", errors, $"titleLines[{i}].");
                        OptionalString(line, "em", errors, $"titleLines[{i}].");
                    }
                }

                if (RequireObject(obj, "imageCaption", errors) is { } cap)
                {
                    RequireString(cap, "title", errors, "imageCaption.");
                    RequireString(cap, "meta", errors, "imageCaption.");
                }

                OptionalGuid(obj, "imageId", errors);
                break;

            case "statement":
                RequireString(obj, "label", errors);
                RequireString(obj, "text", errors);
                OptionalString(obj, "em", errors);
                break;

            case "rooms":
                if (RequireArray(obj, "items", errors) is { } rooms)
                {
                    for (var i = 0; i < rooms.Count; i++)
                    {
                        if (rooms[i] is not JsonObject room)
                        {
                            errors.Add($"items[{i}] must be an object.");
                            continue;
                        }

                        var p = $"items[{i}].";
                        RequireString(room, "numeral", errors, p);
                        RequireString(room, "title", errors, p);
                        RequireString(room, "text", errors, p);
                        RequireString(room, "linkText", errors, p);
                        if (RequireObject(room, "imageTag", errors, p) is { } tag)
                        {
                            RequireString(tag, "title", errors, p + "imageTag.");
                            RequireString(tag, "meta", errors, p + "imageTag.");
                        }

                        if (TryGetString(room, "species") is { } species)
                        {
                            if (!SpeciesValues.Contains(species))
                            {
                                errors.Add($"{p}species must be one of: {string.Join(", ", SpeciesValues)}.");
                            }
                        }
                        else
                        {
                            errors.Add($"{p}species is required and must be a string.");
                        }

                        OptionalGuid(room, "imageId", errors, p);
                    }
                }

                break;

            case "gallery":
                RequireString(obj, "label", errors);
                RequireString(obj, "title", errors);
                break;

            case "videoSection":
                RequireString(obj, "label", errors);
                RequireString(obj, "title", errors);
                RequireString(obj, "captionTitle", errors);
                RequireString(obj, "captionMeta", errors);
                NullableString(obj, "youtubeId", errors);
                NullableString(obj, "videoUrl", errors);
                OptionalGuid(obj, "coverImageId", errors);
                break;

            case "testimonial":
                RequireString(obj, "quote", errors);
                RequireString(obj, "who", errors);
                break;

            case "stats":
                if (RequireArray(obj, "items", errors) is { } stats)
                {
                    for (var i = 0; i < stats.Count; i++)
                    {
                        if (stats[i] is not JsonObject stat)
                        {
                            errors.Add($"items[{i}] must be an object.");
                            continue;
                        }

                        var p = $"items[{i}].";
                        if (stat["value"] is not JsonValue v || !v.TryGetValue<double>(out _))
                        {
                            errors.Add($"{p}value is required and must be a number.");
                        }

                        OptionalString(stat, "suffix", errors, p);
                        RequireString(stat, "label", errors, p);
                    }
                }

                break;

            case "contact":
                RequireString(obj, "label", errors);
                RequireString(obj, "title", errors);
                OptionalString(obj, "em", errors);
                RequireString(obj, "text", errors);
                RequireString(obj, "ctaText", errors);
                RequireString(obj, "altText", errors);
                RequireString(obj, "email", errors);
                RequireString(obj, "phone", errors);
                RequireString(obj, "phoneDisplay", errors);
                RequireString(obj, "address", errors);
                break;

            case "socialLinks":
                OptionalString(obj, "instagram", errors);
                OptionalString(obj, "facebook", errors);
                OptionalString(obj, "youtube", errors);
                OptionalString(obj, "tiktok", errors);
                break;

            case "seo":
                RequireString(obj, "title", errors);
                RequireString(obj, "description", errors);
                OptionalString(obj, "ogImage", errors);
                break;
        }

        return errors;
    }

    private static string? TryGetString(JsonObject obj, string name) =>
        obj[name] is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    private static void RequireString(JsonObject obj, string name, List<string> errors, string prefix = "")
    {
        if (TryGetString(obj, name) is null)
        {
            errors.Add($"{prefix}{name} is required and must be a string.");
        }
    }

    /// <summary>Property may be absent or null, but if present must be a string.</summary>
    private static void OptionalString(JsonObject obj, string name, List<string> errors, string prefix = "")
    {
        if (!obj.ContainsKey(name) || obj[name] is null)
        {
            return;
        }

        if (TryGetString(obj, name) is null)
        {
            errors.Add($"{prefix}{name} must be a string when present.");
        }
    }

    /// <summary>Property must be a string or null (absence also allowed).</summary>
    private static void NullableString(JsonObject obj, string name, List<string> errors) =>
        OptionalString(obj, name, errors);

    /// <summary>Property may be absent or null; when present it must be a GUID string (a MediaAsset id).</summary>
    private static void OptionalGuid(JsonObject obj, string name, List<string> errors, string prefix = "")
    {
        if (!obj.ContainsKey(name) || obj[name] is null)
        {
            return;
        }

        if (TryGetString(obj, name) is not { } s || !Guid.TryParse(s, out _))
        {
            errors.Add($"{prefix}{name} must be a media asset id (GUID) when present.");
        }
    }

    private static JsonArray? RequireArray(JsonObject obj, string name, List<string> errors)
    {
        if (obj[name] is JsonArray arr)
        {
            return arr;
        }

        errors.Add($"{name} is required and must be an array.");
        return null;
    }

    private static JsonObject? RequireObject(JsonObject obj, string name, List<string> errors, string prefix = "")
    {
        if (obj[name] is JsonObject o)
        {
            return o;
        }

        errors.Add($"{prefix}{name} is required and must be an object.");
        return null;
    }
}
