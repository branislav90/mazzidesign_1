using System.Net;
using System.Text;
using System.Text.Json;
using Api.Contracts;

namespace Api.Services;

/// <summary>Renders the workshop notification email (HTML table + raw JSON) for a new enquiry.</summary>
public static class EnquiryEmailComposer
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
    };

    public static (string Subject, string HtmlBody, string RawJson) Compose(
        string reference, EnquiryCreateRequest request, bool hasSnapshot, int photoCount)
    {
        var subject = $"New enquiry {reference} — {request.Category} / {request.ItemType}";

        var rows = new List<(string Label, string Value)>
        {
            ("Reference", reference),
            ("Category", request.Category),
            ("Item type", request.ItemType),
            ("Shape", request.Shape ?? "—"),
        };

        foreach (var (key, value) in request.DimensionsMm ?? new Dictionary<string, double?>())
        {
            rows.Add(($"Dimension · {key}", value is null ? "not sure" : $"{value:0.##} mm"));
        }

        if (request.Derived is { } d)
        {
            if (d.LinearMeters is { } lm) rows.Add(("Linear meters", $"{lm:0.##} m"));
            if (d.FrontAreaM2 is { } fa) rows.Add(("Front area", $"{fa:0.##} m²"));
            if (d.BoardVolumeM3 is { } bv) rows.Add(("Board volume", $"{bv:0.###} m³"));
        }

        rows.Add(("Species", request.Material?.Species ?? "not sure"));
        rows.Add(("Finish", request.Material?.Finish ?? "not sure"));
        rows.Add(("Extras", request.Extras is { Count: > 0 } ? string.Join(", ", request.Extras) : "—"));
        rows.Add(("Name", request.Contact?.Name ?? ""));
        rows.Add(("Email", request.Contact?.Email ?? ""));
        rows.Add(("Phone", request.Contact?.Phone ?? ""));
        rows.Add(("Town", request.Contact?.Town ?? "—"));
        rows.Add(("Timeframe", request.Timeframe ?? "—"));
        rows.Add(("Notes", string.IsNullOrWhiteSpace(request.Notes) ? "—" : request.Notes));
        rows.Add(("Customer photos", photoCount.ToString()));
        rows.Add(("Locale", request.Locale));

        var sb = new StringBuilder();
        sb.Append("<html><body style=\"font-family:Arial,sans-serif;color:#221C16\">");
        sb.Append($"<h2 style=\"font-weight:normal\">New enquiry <strong>{WebUtility.HtmlEncode(reference)}</strong></h2>");
        sb.Append("<table cellpadding=\"8\" cellspacing=\"0\" style=\"border-collapse:collapse;min-width:480px\">");
        var odd = true;
        foreach (var (label, value) in rows)
        {
            var bg = odd ? "#F7F4EF" : "#FFFFFF";
            sb.Append($"<tr style=\"background:{bg}\">");
            sb.Append($"<td style=\"border:1px solid #ddd;white-space:nowrap\"><strong>{WebUtility.HtmlEncode(label)}</strong></td>");
            sb.Append($"<td style=\"border:1px solid #ddd\">{WebUtility.HtmlEncode(value)}</td>");
            sb.Append("</tr>");
            odd = !odd;
        }

        sb.Append("</table>");

        if (hasSnapshot)
        {
            sb.Append("<h3 style=\"font-weight:normal;margin-top:24px\">3D snapshot</h3>");
            sb.Append("<img src=\"cid:snapshot\" alt=\"3D snapshot\" style=\"max-width:640px;border:1px solid #ddd\" />");
        }

        sb.Append("<p style=\"color:#8A8074;margin-top:24px\">The raw enquiry JSON is attached.</p>");
        sb.Append("</body></html>");

        var rawJson = JsonSerializer.Serialize(new { reference, enquiry = request }, JsonOptions);
        return (subject, sb.ToString(), rawJson);
    }
}
