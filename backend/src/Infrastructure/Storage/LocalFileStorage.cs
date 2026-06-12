namespace Infrastructure.Storage;

/// <summary>Stores files on local disk under a single root directory (backend/storage in dev).</summary>
public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(string root)
    {
        _root = Path.GetFullPath(root);
        Directory.CreateDirectory(_root);
    }

    public string Root => _root;

    public async Task SaveAsync(string relativePath, byte[] content, CancellationToken ct = default)
    {
        var path = Resolve(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await File.WriteAllBytesAsync(path, content, ct);
    }

    public void Delete(string relativePath)
    {
        var path = Resolve(relativePath);
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }

    public bool Exists(string relativePath) => File.Exists(Resolve(relativePath));

    private string Resolve(string relativePath)
    {
        var full = Path.GetFullPath(Path.Combine(_root, relativePath));
        if (!full.StartsWith(_root, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Path escapes the storage root.");
        }

        return full;
    }
}
