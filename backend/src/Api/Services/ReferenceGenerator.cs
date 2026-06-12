namespace Api.Services;

/// <summary>Enquiry reference numbers: ENQ-YYYY-NNNN with a per-year sequence.</summary>
public static class ReferenceGenerator
{
    public static string Prefix(int year) => $"ENQ-{year}-";

    public static string Format(int year, int sequence) => $"{Prefix(year)}{sequence:D4}";

    /// <summary>Next sequence after the highest existing reference for the year (1 when none).</summary>
    public static int NextSequence(string? lastReference, int year)
    {
        var prefix = Prefix(year);
        if (lastReference is null
            || !lastReference.StartsWith(prefix, StringComparison.Ordinal)
            || !int.TryParse(lastReference.AsSpan(prefix.Length), out var last)
            || last < 0)
        {
            return 1;
        }

        return last + 1;
    }
}
