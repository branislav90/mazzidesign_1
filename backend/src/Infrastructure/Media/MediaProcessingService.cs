using Domain.Entities;
using Infrastructure.Storage;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace Infrastructure.Media;

/// <summary>
/// Re-encodes uploaded images into webp variants (thumb ~400px, medium ~1000px,
/// large ~1920px wide) and keeps the original. Returns an unsaved MediaAsset.
/// </summary>
public class MediaProcessingService
{
    private static readonly WebpEncoder Encoder = new() { Quality = 82 };

    private const int ThumbWidth = 400;
    private const int MediumWidth = 1000;
    private const int LargeWidth = 1920;

    private readonly IFileStorage _storage;

    public MediaProcessingService(IFileStorage storage)
    {
        _storage = storage;
    }

    public async Task<MediaAsset> CreateAsync(
        byte[] content, string fileName, string contentType, CancellationToken ct = default)
    {
        var id = Guid.NewGuid();
        var originalExt = ExtensionFor(contentType);
        var pathOriginal = $"{id:N}_original{originalExt}";
        var pathLarge = $"{id:N}_large.webp";
        var pathMedium = $"{id:N}_medium.webp";
        var pathThumb = $"{id:N}_thumb.webp";

        await _storage.SaveAsync(pathOriginal, content, ct);

        using (var image = Image.Load(content))
        {
            await SaveVariantAsync(image, LargeWidth, pathLarge, ct);
            await SaveVariantAsync(image, MediumWidth, pathMedium, ct);
            await SaveVariantAsync(image, ThumbWidth, pathThumb, ct);
        }

        return new MediaAsset
        {
            Id = id,
            FileName = fileName,
            ContentType = contentType,
            SizeBytes = content.LongLength,
            PathOriginal = pathOriginal,
            PathLarge = pathLarge,
            PathMedium = pathMedium,
            PathThumb = pathThumb,
            CreatedAt = DateTime.UtcNow,
        };
    }

    public void DeleteFiles(MediaAsset asset)
    {
        _storage.Delete(asset.PathOriginal);
        _storage.Delete(asset.PathLarge);
        _storage.Delete(asset.PathMedium);
        _storage.Delete(asset.PathThumb);
    }

    private async Task SaveVariantAsync(Image source, int maxWidth, string relativePath, CancellationToken ct)
    {
        using var ms = new MemoryStream();
        if (source.Width > maxWidth)
        {
            using var resized = source.Clone(x => x.Resize(maxWidth, 0));
            await resized.SaveAsync(ms, Encoder, ct);
        }
        else
        {
            await source.SaveAsync(ms, Encoder, ct);
        }

        await _storage.SaveAsync(relativePath, ms.ToArray(), ct);
    }

    private static string ExtensionFor(string contentType) => contentType.ToLowerInvariant() switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => ".bin",
    };
}
