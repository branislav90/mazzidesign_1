using Microsoft.AspNetCore.Identity;

namespace Domain.Entities;

/// <summary>Workshop admin account. No public registration — seeded via migration/env.</summary>
public class AdminUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
}
