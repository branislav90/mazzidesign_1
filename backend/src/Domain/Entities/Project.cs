namespace Domain.Entities;

/// <summary>Gallery/portfolio item shown on the landing page.</summary>
public class Project
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public ProjectCategory Category { get; set; }
    public string TitleSl { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string DescriptionSl { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public WoodSpecies Species { get; set; }
    public string Town { get; set; } = string.Empty;
    public int Year { get; set; }
    public int SortOrder { get; set; }
    public bool IsFeatured { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public Guid? CoverImageId { get; set; }
    public MediaAsset? CoverImage { get; set; }
    public List<ProjectImage> Images { get; set; } = [];
}

/// <summary>Ordered image attached to a project, with optional per-locale caption.</summary>
public class ProjectImage
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public Guid MediaAssetId { get; set; }
    public MediaAsset? MediaAsset { get; set; }
    public int SortOrder { get; set; }
    public string? CaptionSl { get; set; }
    public string? CaptionEn { get; set; }
}
