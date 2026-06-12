using Api.Contracts;
using FluentValidation;

namespace Api.Validation;

public class EnquiryCreateRequestValidator : AbstractValidator<EnquiryCreateRequest>
{
    public EnquiryCreateRequestValidator()
    {
        RuleFor(x => x.Category).NotEmpty().MaximumLength(64);
        RuleFor(x => x.ItemType).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Shape).MaximumLength(64);

        RuleFor(x => x.Locale)
            .Must(l => WireEnums.Locales.Contains(l))
            .WithMessage("Locale must be 'sl' or 'en'.");

        RuleFor(x => x.Contact).NotNull().WithMessage("Contact is required.");
        When(x => x.Contact is not null, () =>
        {
            RuleFor(x => x.Contact!.Name).NotEmpty().MaximumLength(200)
                .OverridePropertyName("contact.name");
            RuleFor(x => x.Contact!.Email).NotEmpty().EmailAddress().MaximumLength(256)
                .OverridePropertyName("contact.email");
            RuleFor(x => x.Contact!.Phone).NotEmpty().MaximumLength(40)
                .OverridePropertyName("contact.phone");
            RuleFor(x => x.Contact!.Town).MaximumLength(120)
                .OverridePropertyName("contact.town");
        });

        RuleFor(x => x.Material!.Species)
            .Must(s => s is null || WireEnums.SpeciesValues.Contains(s))
            .When(x => x.Material is not null)
            .WithMessage("material.species must be oak, walnut, ash, smoked_oak or null.")
            .OverridePropertyName("material.species");

        RuleFor(x => x.Material!.Finish)
            .Must(f => f is null || WireEnums.Finishes.Contains(f))
            .When(x => x.Material is not null)
            .WithMessage("material.finish must be oiled, lacquered, hardwax or null.")
            .OverridePropertyName("material.finish");

        RuleFor(x => x.Timeframe)
            .Must(t => t is null || WireEnums.Timeframes.Contains(t))
            .WithMessage("timeframe must be asap, 1-3m, 3-6m, exploring or null.");

        RuleFor(x => x.Photos)
            .Must(p => p is null || p.Count <= 3)
            .WithMessage("At most 3 photos are allowed.");

        RuleFor(x => x.SnapshotDataUrl)
            .Must(s => s is null || s.StartsWith("data:image/", StringComparison.Ordinal))
            .WithMessage("snapshotDataUrl must be a data:image/... URL.")
            .MaximumLength(14_000_000); // ~10 MB decoded

        RuleFor(x => x.Notes).MaximumLength(4000);

        RuleForEach(x => x.DimensionsMm!.Values)
            .Must(v => v is null or >= 0 and <= 1_000_000)
            .When(x => x.DimensionsMm is not null)
            .WithMessage("Dimension values must be null or between 0 and 1,000,000 mm.")
            .OverridePropertyName("dimensionsMm");

        RuleForEach(x => x.Extras)
            .NotEmpty()
            .MaximumLength(120)
            .When(x => x.Extras is not null);
    }
}

public class EnquiryPatchRequestValidator : AbstractValidator<EnquiryPatchRequest>
{
    public EnquiryPatchRequestValidator()
    {
        RuleFor(x => x.Status)
            .Must(s => s is null || WireEnums.EnquiryStatuses.Contains(s))
            .WithMessage("status must be New, Seen, Quoted, Won or Lost.");
        RuleFor(x => x.InternalNotes).MaximumLength(8000);
    }
}
