using Api.Contracts;
using Api.Validation;

namespace Api.IntegrationTests;

public class EnquiryValidatorTests
{
    private readonly EnquiryCreateRequestValidator _validator = new();

    private static EnquiryCreateRequest Valid() => new(
        Category: "kitchen",
        ItemType: "cabinetry",
        Shape: "l-shape",
        DimensionsMm: new Dictionary<string, double?> { ["width"] = 3200, ["depth"] = null },
        Derived: new EnquiryDerivedDto(4.2, 7.8, null),
        Material: new EnquiryMaterialDto("oak", "oiled"),
        Extras: ["soft-close", "led-interior"],
        SnapshotDataUrl: "data:image/png;base64,iVBORw0KGgo=",
        Contact: new EnquiryContactDto("Ana Novak", "ana@example.com", "041123456", "Ljubljana"),
        Timeframe: "1-3m",
        Notes: "Old town apartment.",
        Photos: [Guid.NewGuid()],
        Locale: "sl");

    [Fact]
    public void ValidRequest_Passes()
    {
        Assert.True(_validator.Validate(Valid()).IsValid);
    }

    [Fact]
    public void MinimalRequest_NullsEverywhere_Passes()
    {
        var request = new EnquiryCreateRequest(
            "kitchen", "cabinetry", null, null, null, null, null, null,
            new EnquiryContactDto("Ana", "ana@example.com", "041123456", null),
            null, null, null, "en");
        Assert.True(_validator.Validate(request).IsValid);
    }

    [Fact]
    public void MissingCategory_Fails()
    {
        var result = _validator.Validate(Valid() with { Category = "" });
        Assert.Contains(result.Errors, e => e.PropertyName == "Category");
    }

    [Fact]
    public void MissingContact_Fails()
    {
        var result = _validator.Validate(Valid() with { Contact = null });
        Assert.False(result.IsValid);
    }

    [Fact]
    public void InvalidEmail_Fails()
    {
        var result = _validator.Validate(Valid() with
        {
            Contact = new EnquiryContactDto("Ana", "not-an-email", "041123456", null),
        });
        Assert.Contains(result.Errors, e => e.PropertyName == "contact.email");
    }

    [Fact]
    public void EmptyPhone_Fails()
    {
        var result = _validator.Validate(Valid() with
        {
            Contact = new EnquiryContactDto("Ana", "ana@example.com", "", null),
        });
        Assert.Contains(result.Errors, e => e.PropertyName == "contact.phone");
    }

    [Theory]
    [InlineData("mahogany")]
    [InlineData("OAK")]
    public void InvalidSpecies_Fails(string species)
    {
        var result = _validator.Validate(Valid() with { Material = new EnquiryMaterialDto(species, null) });
        Assert.Contains(result.Errors, e => e.PropertyName == "material.species");
    }

    [Fact]
    public void NullSpeciesAndFinish_Pass()
    {
        var result = _validator.Validate(Valid() with { Material = new EnquiryMaterialDto(null, null) });
        Assert.True(result.IsValid);
    }

    [Fact]
    public void InvalidFinish_Fails()
    {
        var result = _validator.Validate(Valid() with { Material = new EnquiryMaterialDto("oak", "varnished") });
        Assert.Contains(result.Errors, e => e.PropertyName == "material.finish");
    }

    [Theory]
    [InlineData("next-week")]
    [InlineData("6-12m")]
    public void InvalidTimeframe_Fails(string timeframe)
    {
        var result = _validator.Validate(Valid() with { Timeframe = timeframe });
        Assert.Contains(result.Errors, e => e.PropertyName == "Timeframe");
    }

    [Theory]
    [InlineData("asap")]
    [InlineData("1-3m")]
    [InlineData("3-6m")]
    [InlineData("exploring")]
    public void ValidTimeframes_Pass(string timeframe)
    {
        Assert.True(_validator.Validate(Valid() with { Timeframe = timeframe }).IsValid);
    }

    [Fact]
    public void MoreThanThreePhotos_Fails()
    {
        var photos = Enumerable.Range(0, 4).Select(_ => Guid.NewGuid()).ToList();
        var result = _validator.Validate(Valid() with { Photos = photos });
        Assert.Contains(result.Errors, e => e.PropertyName == "Photos");
    }

    [Fact]
    public void SnapshotNotADataImageUrl_Fails()
    {
        var result = _validator.Validate(Valid() with { SnapshotDataUrl = "https://example.com/snap.png" });
        Assert.Contains(result.Errors, e => e.PropertyName == "SnapshotDataUrl");
    }

    [Fact]
    public void NegativeDimension_Fails()
    {
        var result = _validator.Validate(Valid() with
        {
            DimensionsMm = new Dictionary<string, double?> { ["width"] = -10 },
        });
        Assert.Contains(result.Errors, e => e.PropertyName.StartsWith("dimensionsMm"));
    }

    [Theory]
    [InlineData("de")]
    [InlineData("")]
    public void InvalidLocale_Fails(string locale)
    {
        var result = _validator.Validate(Valid() with { Locale = locale });
        Assert.Contains(result.Errors, e => e.PropertyName == "Locale");
    }

    [Fact]
    public void PatchValidator_AcceptsKnownStatusesAndRejectsUnknown()
    {
        var patchValidator = new EnquiryPatchRequestValidator();
        Assert.True(patchValidator.Validate(new EnquiryPatchRequest("Seen", "called them")).IsValid);
        Assert.True(patchValidator.Validate(new EnquiryPatchRequest(null, null)).IsValid);
        Assert.False(patchValidator.Validate(new EnquiryPatchRequest("Archived", null)).IsValid);
    }
}
