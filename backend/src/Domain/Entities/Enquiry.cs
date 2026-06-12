namespace Domain.Entities;

/// <summary>Configurator submission. Structured parts are stored as JSON strings so no field is ever lost to free text.</summary>
public class Enquiry
{
    public Guid Id { get; set; }
    /// <summary>Server-generated, format ENQ-YYYY-NNNN, unique.</summary>
    public string Reference { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ItemType { get; set; } = string.Empty;
    public string? Shape { get; set; }
    /// <summary>JSON object: Record&lt;string, number|null&gt;.</summary>
    public string DimensionsMmJson { get; set; } = "{}";
    /// <summary>JSON object: { linearMeters?, frontAreaM2?, boardVolumeM3? }.</summary>
    public string DerivedJson { get; set; } = "{}";
    /// <summary>JSON object: { species, finish }.</summary>
    public string MaterialJson { get; set; } = "{}";
    /// <summary>JSON array of strings.</summary>
    public string ExtrasJson { get; set; } = "[]";
    public Guid? SnapshotMediaId { get; set; }
    public MediaAsset? SnapshotMedia { get; set; }
    /// <summary>JSON array of MediaAsset GUID strings (customer photos).</summary>
    public string PhotoIdsJson { get; set; } = "[]";
    public string ContactName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string? ContactTown { get; set; }
    public string? Timeframe { get; set; }
    public string? Notes { get; set; }
    public string Locale { get; set; } = "sl";
    public EnquiryStatus Status { get; set; } = EnquiryStatus.New;
    public string? InternalNotes { get; set; }
    public DateTime CreatedAt { get; set; }
}
