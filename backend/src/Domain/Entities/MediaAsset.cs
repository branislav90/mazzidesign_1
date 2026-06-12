namespace Domain.Entities;

/// <summary>Uploaded file with pre-rendered webp variants (original kept as-is).</summary>
public class MediaAsset
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string PathOriginal { get; set; } = string.Empty;
    public string PathLarge { get; set; } = string.Empty;
    public string PathMedium { get; set; } = string.Empty;
    public string PathThumb { get; set; } = string.Empty;
    public string? AltTextSl { get; set; }
    public string? AltTextEn { get; set; }
    public DateTime CreatedAt { get; set; }
}
