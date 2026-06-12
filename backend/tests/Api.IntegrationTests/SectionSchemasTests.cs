using Api.Content;

namespace Api.IntegrationTests;

public class SectionSchemasTests
{
    [Fact]
    public void Keys_CoverEveryContractSection()
    {
        string[] expected =
        [
            "hero", "statement", "rooms", "gallery", "videoSection",
            "testimonial", "stats", "contact", "socialLinks", "seo",
        ];
        Assert.Equal(expected.OrderBy(k => k), SectionSchemas.Keys.OrderBy(k => k));
    }

    [Fact]
    public void UnknownKey_IsRejected()
    {
        Assert.False(SectionSchemas.IsKnownKey("marquee"));
        Assert.NotEmpty(SectionSchemas.Validate("marquee", "{}"));
    }

    [Fact]
    public void InvalidJson_IsRejected()
    {
        var errors = SectionSchemas.Validate("hero", "{not json");
        Assert.Contains(errors, e => e.Contains("not valid JSON"));
    }

    [Fact]
    public void NonObjectRoot_IsRejected()
    {
        var errors = SectionSchemas.Validate("hero", "[1,2,3]");
        Assert.Contains(errors, e => e.Contains("must be a JSON object"));
    }

    [Fact]
    public void Hero_Valid_Passes()
    {
        const string json = """
        {
          "label": "Fine woodwork · Ljubljana · since 1998",
          "titleLines": [
            { "text": "Rooms composed" },
            { "text": "in solid wood", "em": "solid wood" }
          ],
          "sub": "Kitchens, bathrooms, bedrooms...",
          "imageCaption": { "title": "European oak, quarter-sawn", "meta": "The material we build a house around" }
        }
        """;
        Assert.Empty(SectionSchemas.Validate("hero", json));
    }

    [Fact]
    public void Hero_MissingSubAndCaption_Fails()
    {
        const string json = """{ "label": "x", "titleLines": [{ "text": "y" }] }""";
        var errors = SectionSchemas.Validate("hero", json);
        Assert.Contains(errors, e => e.Contains("sub"));
        Assert.Contains(errors, e => e.Contains("imageCaption"));
    }

    [Fact]
    public void Statement_Valid_Passes_AndEmIsOptional()
    {
        Assert.Empty(SectionSchemas.Validate("statement", """{ "label": "The atelier", "text": "We make few things." }"""));
        Assert.Empty(SectionSchemas.Validate("statement", """{ "label": "The atelier", "text": "x", "em": "x" }"""));
    }

    [Fact]
    public void Rooms_Valid_Passes()
    {
        const string json = """
        {
          "items": [
            {
              "numeral": "I", "title": "The kitchen", "text": "...", "linkText": "Begin with this room",
              "imageTag": { "title": "Oak kitchen", "meta": "Ljubljana · 2026" },
              "species": "oak"
            }
          ]
        }
        """;
        Assert.Empty(SectionSchemas.Validate("rooms", json));
    }

    [Fact]
    public void Rooms_InvalidSpecies_Fails()
    {
        const string json = """
        {
          "items": [
            {
              "numeral": "I", "title": "t", "text": "x", "linkText": "l",
              "imageTag": { "title": "a", "meta": "b" },
              "species": "mahogany"
            }
          ]
        }
        """;
        var errors = SectionSchemas.Validate("rooms", json);
        Assert.Contains(errors, e => e.Contains("species"));
    }

    [Fact]
    public void Gallery_MissingTitle_Fails()
    {
        var errors = SectionSchemas.Validate("gallery", """{ "label": "Selected works" }""");
        Assert.Contains(errors, e => e.Contains("title"));
    }

    [Fact]
    public void VideoSection_NullYoutubeIdAndVideoUrl_Passes()
    {
        const string json = """
        {
          "label": "The workshop, in motion", "title": "Watch a room take shape",
          "youtubeId": null, "videoUrl": null,
          "captionTitle": "From rough board to finished kitchen", "captionMeta": "3 min · filmed in our atelier"
        }
        """;
        Assert.Empty(SectionSchemas.Validate("videoSection", json));
    }

    [Fact]
    public void VideoSection_NonStringYoutubeId_Fails()
    {
        const string json = """
        { "label": "l", "title": "t", "youtubeId": 42, "videoUrl": null, "captionTitle": "c", "captionMeta": "m" }
        """;
        var errors = SectionSchemas.Validate("videoSection", json);
        Assert.Contains(errors, e => e.Contains("youtubeId"));
    }

    [Fact]
    public void Testimonial_Valid_Passes_AndMissingWho_Fails()
    {
        Assert.Empty(SectionSchemas.Validate("testimonial", """{ "quote": "q", "who": "w" }"""));
        Assert.Contains(SectionSchemas.Validate("testimonial", """{ "quote": "q" }"""), e => e.Contains("who"));
    }

    [Fact]
    public void Stats_Valid_Passes()
    {
        const string json = """
        {
          "items": [
            { "value": 27, "label": "Years of craft" },
            { "value": 400, "suffix": "+", "label": "Rooms delivered" },
            { "value": 5, "suffix": " yr", "label": "Warranty" },
            { "value": 1, "label": "Atelier, start to finish" }
          ]
        }
        """;
        Assert.Empty(SectionSchemas.Validate("stats", json));
    }

    [Fact]
    public void Stats_NonNumericValue_Fails()
    {
        var errors = SectionSchemas.Validate("stats", """{ "items": [ { "value": "many", "label": "x" } ] }""");
        Assert.Contains(errors, e => e.Contains("value"));
    }

    [Fact]
    public void Contact_Valid_Passes_AndMissingPhoneDisplay_Fails()
    {
        const string valid = """
        {
          "label": "Commissions · 2026", "title": "Begin with a conversation", "em": "conversation",
          "text": "Tell us about the room.", "ctaText": "Enquire", "altText": "or call",
          "email": "atelier@hrast.si", "phone": "+38641123456", "phoneDisplay": "041 123 456",
          "address": "Obrtna cona 12, Ljubljana"
        }
        """;
        Assert.Empty(SectionSchemas.Validate("contact", valid));

        const string invalid = """
        {
          "label": "l", "title": "t", "text": "x", "ctaText": "c", "altText": "a",
          "email": "e@e.si", "phone": "+386", "address": "a"
        }
        """;
        Assert.Contains(SectionSchemas.Validate("contact", invalid), e => e.Contains("phoneDisplay"));
    }

    [Fact]
    public void SocialLinks_AllOptional_EmptyObjectPasses()
    {
        Assert.Empty(SectionSchemas.Validate("socialLinks", "{}"));
        Assert.Empty(SectionSchemas.Validate("socialLinks", """{ "instagram": "https://instagram.com/x" }"""));
    }

    [Fact]
    public void SocialLinks_NonStringValue_Fails()
    {
        Assert.Contains(SectionSchemas.Validate("socialLinks", """{ "instagram": 5 }"""), e => e.Contains("instagram"));
    }

    [Fact]
    public void Seo_Valid_Passes_AndMissingDescription_Fails()
    {
        Assert.Empty(SectionSchemas.Validate("seo", """{ "title": "HRAST", "description": "Fine woodwork." }"""));
        Assert.Contains(SectionSchemas.Validate("seo", """{ "title": "HRAST" }"""), e => e.Contains("description"));
    }
}
