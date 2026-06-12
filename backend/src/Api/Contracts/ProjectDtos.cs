namespace Api.Contracts;

/// <summary>Localized public project shape.</summary>
public record ProjectDto(
    Guid Id,
    string Slug,
    string Category,
    string Title,
    string Description,
    string Species,
    string Town,
    int Year,
    bool IsFeatured,
    MediaRefDto? CoverImage,
    List<MediaRefDto> Images);

/// <summary>Admin project shape: both locales raw.</summary>
public record AdminProjectDto(
    Guid Id,
    string Slug,
    string Category,
    string TitleSl,
    string TitleEn,
    string DescriptionSl,
    string DescriptionEn,
    string Species,
    string Town,
    int Year,
    int SortOrder,
    bool IsFeatured,
    string Status,
    Guid? CoverImageId,
    List<AdminProjectImageDto> Images);

public record AdminProjectImageDto(
    Guid Id,
    Guid MediaAssetId,
    int SortOrder,
    string? CaptionSl,
    string? CaptionEn,
    string Url,
    string ThumbUrl,
    string MediumUrl);

public record ProjectUpsertRequest(
    string Slug,
    string Category,
    string TitleSl,
    string TitleEn,
    string DescriptionSl,
    string DescriptionEn,
    string Species,
    string Town,
    int Year,
    int SortOrder,
    bool IsFeatured,
    string Status,
    Guid? CoverImageId);

public record ImageOrderRequest(List<Guid> ImageIds);
