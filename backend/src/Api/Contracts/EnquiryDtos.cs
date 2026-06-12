namespace Api.Contracts;

public record EnquiryDerivedDto(double? LinearMeters, double? FrontAreaM2, double? BoardVolumeM3);

public record EnquiryMaterialDto(string? Species, string? Finish);

public record EnquiryContactDto(string Name, string Email, string Phone, string? Town);

/// <summary>POST /api/enquiries body — AGENTS.md §8 minus the server-generated reference.</summary>
public record EnquiryCreateRequest(
    string Category,
    string ItemType,
    string? Shape,
    Dictionary<string, double?>? DimensionsMm,
    EnquiryDerivedDto? Derived,
    EnquiryMaterialDto? Material,
    List<string>? Extras,
    string? SnapshotDataUrl,
    EnquiryContactDto? Contact,
    string? Timeframe,
    string? Notes,
    List<Guid>? Photos,
    string Locale);

public record EnquiryPatchRequest(string? Status, string? InternalNotes);

public record EnquirySummaryDto(
    Guid Id,
    string Reference,
    string Status,
    string Category,
    string ItemType,
    string ContactName,
    string ContactEmail,
    DateTime CreatedAt);
