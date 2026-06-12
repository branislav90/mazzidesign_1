namespace Domain.Entities;

public enum ProjectCategory
{
    Kitchen,
    Bath,
    Bedroom,
    Custom,
    Millwork,
    Outdoor,
}

public enum WoodSpecies
{
    Oak,
    Walnut,
    Ash,
    SmokedOak,
    Other,
}

public enum ProjectStatus
{
    Draft,
    Published,
}

public enum EnquiryStatus
{
    New,
    Seen,
    Quoted,
    Won,
    Lost,
}
