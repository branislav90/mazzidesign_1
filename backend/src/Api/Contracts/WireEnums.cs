using Domain.Entities;

namespace Api.Contracts;

/// <summary>Maps domain enums to/from the wire strings defined by the API contract.</summary>
public static class WireEnums
{
    public static readonly string[] Categories = ["kitchen", "bath", "bedroom", "custom", "millwork", "outdoor"];
    public static readonly string[] SpeciesValues = ["oak", "walnut", "ash", "smoked_oak", "other"];
    public static readonly string[] Statuses = ["Draft", "Published"];
    public static readonly string[] EnquiryStatuses = ["New", "Seen", "Quoted", "Won", "Lost"];
    public static readonly string[] Finishes = ["oiled", "lacquered", "hardwax"];
    public static readonly string[] Timeframes = ["asap", "1-3m", "3-6m", "exploring"];
    public static readonly string[] Locales = ["sl", "en"];

    public static string ToWire(this ProjectCategory value) => value switch
    {
        ProjectCategory.Kitchen => "kitchen",
        ProjectCategory.Bath => "bath",
        ProjectCategory.Bedroom => "bedroom",
        ProjectCategory.Custom => "custom",
        ProjectCategory.Millwork => "millwork",
        ProjectCategory.Outdoor => "outdoor",
        _ => throw new ArgumentOutOfRangeException(nameof(value)),
    };

    public static bool TryParseCategory(string? wire, out ProjectCategory value)
    {
        value = wire switch
        {
            "kitchen" => ProjectCategory.Kitchen,
            "bath" => ProjectCategory.Bath,
            "bedroom" => ProjectCategory.Bedroom,
            "custom" => ProjectCategory.Custom,
            "millwork" => ProjectCategory.Millwork,
            "outdoor" => ProjectCategory.Outdoor,
            _ => (ProjectCategory)(-1),
        };
        return (int)value >= 0;
    }

    public static string ToWire(this WoodSpecies value) => value switch
    {
        WoodSpecies.Oak => "oak",
        WoodSpecies.Walnut => "walnut",
        WoodSpecies.Ash => "ash",
        WoodSpecies.SmokedOak => "smoked_oak",
        WoodSpecies.Other => "other",
        _ => throw new ArgumentOutOfRangeException(nameof(value)),
    };

    public static bool TryParseSpecies(string? wire, out WoodSpecies value)
    {
        value = wire switch
        {
            "oak" => WoodSpecies.Oak,
            "walnut" => WoodSpecies.Walnut,
            "ash" => WoodSpecies.Ash,
            "smoked_oak" => WoodSpecies.SmokedOak,
            "other" => WoodSpecies.Other,
            _ => (WoodSpecies)(-1),
        };
        return (int)value >= 0;
    }

    public static string ToWire(this ProjectStatus value) => value.ToString();

    public static bool TryParseStatus(string? wire, out ProjectStatus value) =>
        Enum.TryParse(wire, ignoreCase: false, out value) && Enum.IsDefined(value);

    public static string ToWire(this EnquiryStatus value) => value.ToString();

    public static bool TryParseEnquiryStatus(string? wire, out EnquiryStatus value) =>
        Enum.TryParse(wire, ignoreCase: false, out value) && Enum.IsDefined(value);

    public static string NormalizeLocale(string? locale) => locale == "en" ? "en" : "sl";
}
