using System.Text.RegularExpressions;
using Api.Contracts;
using FluentValidation;

namespace Api.Validation;

public partial class ProjectUpsertRequestValidator : AbstractValidator<ProjectUpsertRequest>
{
    public ProjectUpsertRequestValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .MaximumLength(160)
            .Must(s => s is not null && SlugRegex().IsMatch(s))
            .WithMessage("Slug must contain only lowercase letters, digits and hyphens.");

        RuleFor(x => x.Category)
            .Must(c => WireEnums.Categories.Contains(c))
            .WithMessage("category must be kitchen, bath, bedroom, custom, millwork or outdoor.");

        RuleFor(x => x.Species)
            .Must(s => WireEnums.SpeciesValues.Contains(s))
            .WithMessage("species must be oak, walnut, ash, smoked_oak or other.");

        RuleFor(x => x.Status)
            .Must(s => WireEnums.Statuses.Contains(s))
            .WithMessage("status must be Draft or Published.");

        RuleFor(x => x.TitleSl).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DescriptionSl).NotNull();
        RuleFor(x => x.DescriptionEn).NotNull();
        RuleFor(x => x.Town).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Year).InclusiveBetween(1900, 2100);
    }

    [GeneratedRegex("^[a-z0-9]+(-[a-z0-9]+)*$")]
    private static partial Regex SlugRegex();
}

public class ImageOrderRequestValidator : AbstractValidator<ImageOrderRequest>
{
    public ImageOrderRequestValidator()
    {
        RuleFor(x => x.ImageIds).NotNull().NotEmpty();
    }
}

public class ContentPutRequestValidator : AbstractValidator<ContentPutRequest>
{
    public ContentPutRequestValidator()
    {
        RuleFor(x => x.JsonSl).NotEmpty();
        RuleFor(x => x.JsonEn).NotEmpty();
    }
}
