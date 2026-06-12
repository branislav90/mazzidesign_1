namespace Domain.Entities;

/// <summary>Structured landing-page content; one row per section key, JSON per locale.</summary>
public class PageSection
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string JsonSl { get; set; } = "{}";
    public string JsonEn { get; set; } = "{}";
    public DateTime UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
