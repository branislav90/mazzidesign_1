using System.IdentityModel.Tokens.Jwt;
using Api.Auth;
using Domain.Entities;
using Microsoft.Extensions.Options;

namespace Api.IntegrationTests;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateService() => new(Options.Create(new JwtOptions
    {
        Issuer = "test-issuer",
        Audience = "test-audience",
        Secret = "unit-test-secret-0123456789abcdef0123456789",
        AccessTokenMinutes = 15,
        RefreshTokenDays = 7,
    }));

    [Fact]
    public void CreateAccessToken_ContainsUserClaimsAndRoles()
    {
        var user = new AdminUser { Id = Guid.NewGuid(), Email = "admin@test.local" };

        var token = CreateService().CreateAccessToken(user, ["Admin"]);
        var parsed = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal("test-issuer", parsed.Issuer);
        Assert.Equal(user.Id.ToString(), parsed.Subject);
        Assert.Contains(parsed.Claims, c => c.Value == "Admin");
        Assert.True(parsed.ValidTo > DateTime.UtcNow);
    }

    [Fact]
    public void CreateRefreshToken_HashMatchesStaticHasher()
    {
        var (token, hash) = CreateService().CreateRefreshToken();

        Assert.NotEqual(token, hash);
        Assert.Equal(hash, JwtTokenService.HashToken(token));
    }
}
