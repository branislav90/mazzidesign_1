using Api.Services;

namespace Api.IntegrationTests;

public class ReferenceGeneratorTests
{
    [Fact]
    public void Format_ProducesContractShape()
    {
        Assert.Equal("ENQ-2026-0001", ReferenceGenerator.Format(2026, 1));
        Assert.Equal("ENQ-2026-0042", ReferenceGenerator.Format(2026, 42));
        Assert.Equal("ENQ-2031-9999", ReferenceGenerator.Format(2031, 9999));
    }

    [Fact]
    public void NextSequence_StartsAtOneWhenNoneExist()
    {
        Assert.Equal(1, ReferenceGenerator.NextSequence(null, 2026));
    }

    [Fact]
    public void NextSequence_IncrementsHighestExisting()
    {
        Assert.Equal(43, ReferenceGenerator.NextSequence("ENQ-2026-0042", 2026));
        Assert.Equal(2, ReferenceGenerator.NextSequence("ENQ-2026-0001", 2026));
    }

    [Fact]
    public void NextSequence_ResetsPerYear()
    {
        Assert.Equal(1, ReferenceGenerator.NextSequence("ENQ-2025-0042", 2026));
    }

    [Fact]
    public void NextSequence_IgnoresMalformedReferences()
    {
        Assert.Equal(1, ReferenceGenerator.NextSequence("ENQ-2026-XXXX", 2026));
        Assert.Equal(1, ReferenceGenerator.NextSequence("garbage", 2026));
        Assert.Equal(1, ReferenceGenerator.NextSequence(string.Empty, 2026));
    }

    [Fact]
    public void Format_RoundTripsThroughNextSequence()
    {
        var reference = ReferenceGenerator.Format(2026, 7);
        Assert.Equal(8, ReferenceGenerator.NextSequence(reference, 2026));
    }
}
