using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Infrastructure.Persistence;

/// <summary>Lets `dotnet ef` create migrations without a running host or database.</summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost,14333;Database=woodwork;User Id=sa;Password=design-time-only;TrustServerCertificate=True")
            .Options;
        return new AppDbContext(options);
    }
}
