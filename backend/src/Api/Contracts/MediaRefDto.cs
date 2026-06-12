namespace Api.Contracts;

/// <summary>Shared media reference shape: absolute URLs per the API contract.</summary>
public record MediaRefDto(Guid Id, string Url, string ThumbUrl, string MediumUrl, string Alt);
