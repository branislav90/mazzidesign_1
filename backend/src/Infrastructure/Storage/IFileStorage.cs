namespace Infrastructure.Storage;

/// <summary>File storage abstraction so local disk can be swapped for blob storage later.</summary>
public interface IFileStorage
{
    Task SaveAsync(string relativePath, byte[] content, CancellationToken ct = default);
    void Delete(string relativePath);
    bool Exists(string relativePath);
}
