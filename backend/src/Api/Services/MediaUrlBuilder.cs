using Api.Contracts;
using Domain.Entities;

namespace Api.Services;

/// <summary>Builds absolute /uploads URLs and MediaRef DTOs from the current request's scheme + host.</summary>
public class MediaUrlBuilder
{
    private readonly IHttpContextAccessor _accessor;

    public MediaUrlBuilder(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public string BaseUrl
    {
        get
        {
            var request = _accessor.HttpContext?.Request
                ?? throw new InvalidOperationException("No active HTTP request.");
            return $"{request.Scheme}://{request.Host}";
        }
    }

    public string Url(string relativePath) => $"{BaseUrl}/uploads/{relativePath}";

    public MediaRefDto? Build(MediaAsset? asset, string locale, string? altOverride = null)
    {
        if (asset is null)
        {
            return null;
        }

        var alt = altOverride
            ?? (locale == "en" ? asset.AltTextEn : asset.AltTextSl)
            ?? asset.FileName;
        return new MediaRefDto(
            asset.Id, Url(asset.PathLarge), Url(asset.PathThumb), Url(asset.PathMedium), alt);
    }
}
