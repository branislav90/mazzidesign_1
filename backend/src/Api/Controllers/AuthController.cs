using Api.Auth;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AdminUser> _userManager;
    private readonly AppDbContext _db;
    private readonly JwtTokenService _tokens;
    private readonly JwtOptions _jwtOptions;

    public AuthController(
        UserManager<AdminUser> userManager,
        AppDbContext db,
        JwtTokenService tokens,
        IOptions<JwtOptions> jwtOptions)
    {
        _userManager = userManager;
        _db = db;
        _tokens = tokens;
        _jwtOptions = jwtOptions.Value;
    }

    public record LoginRequest(string Email, string Password);
    public record RefreshRequest(string RefreshToken);
    public record TokenResponse(string AccessToken, string RefreshToken, DateTime AccessTokenExpiresAtUtc);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new ProblemDetails { Title = "Invalid credentials." });
        }

        return Ok(await IssueTokensAsync(user));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Refresh(RefreshRequest request)
    {
        var hash = JwtTokenService.HashToken(request.RefreshToken);
        var stored = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash);
        if (stored is null || !stored.IsActive)
        {
            return Unauthorized(new ProblemDetails { Title = "Invalid or expired refresh token." });
        }

        var user = await _userManager.FindByIdAsync(stored.UserId.ToString());
        if (user is null)
        {
            return Unauthorized();
        }

        var response = await IssueTokensAsync(user);

        // Rotate: revoke the used token and link it to its replacement.
        stored.RevokedAtUtc = DateTime.UtcNow;
        stored.ReplacedByTokenHash = JwtTokenService.HashToken(response.RefreshToken);
        await _db.SaveChangesAsync();

        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Logout(RefreshRequest request)
    {
        var hash = JwtTokenService.HashToken(request.RefreshToken);
        var stored = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash);
        if (stored is not null && stored.IsActive)
        {
            stored.RevokedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    private async Task<TokenResponse> IssueTokensAsync(AdminUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var access = _tokens.CreateAccessToken(user, roles);
        var (refresh, refreshHash) = _tokens.CreateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
        });
        await _db.SaveChangesAsync();

        return new TokenResponse(
            access, refresh, DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes));
    }
}
