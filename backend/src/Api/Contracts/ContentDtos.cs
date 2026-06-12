namespace Api.Contracts;

public record ContentPutRequest(string JsonSl, string JsonEn);

public record ContentItemDto(string Key, string JsonSl, string JsonEn, DateTime UpdatedAt);
