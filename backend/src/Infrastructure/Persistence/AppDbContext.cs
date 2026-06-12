using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AdminUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<PageSection> PageSections => Set<PageSection>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Enquiry> Enquiries => Set<Enquiry>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("cms");

        builder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(t => t.TokenHash).IsUnique();
            e.Property(t => t.TokenHash).HasMaxLength(128);
            e.Property(t => t.ReplacedByTokenHash).HasMaxLength(128);
            e.HasOne<AdminUser>().WithMany().HasForeignKey(t => t.UserId);
        });

        builder.Entity<MediaAsset>(e =>
        {
            e.Property(m => m.FileName).HasMaxLength(260);
            e.Property(m => m.ContentType).HasMaxLength(100);
            e.Property(m => m.PathOriginal).HasMaxLength(260);
            e.Property(m => m.PathLarge).HasMaxLength(260);
            e.Property(m => m.PathMedium).HasMaxLength(260);
            e.Property(m => m.PathThumb).HasMaxLength(260);
            e.Property(m => m.AltTextSl).HasMaxLength(500);
            e.Property(m => m.AltTextEn).HasMaxLength(500);
        });

        builder.Entity<Project>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Slug).HasMaxLength(160);
            e.Property(p => p.Category).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.Species).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.TitleSl).HasMaxLength(200);
            e.Property(p => p.TitleEn).HasMaxLength(200);
            e.Property(p => p.Town).HasMaxLength(120);
            e.HasOne(p => p.CoverImage)
                .WithMany()
                .HasForeignKey(p => p.CoverImageId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasMany(p => p.Images)
                .WithOne(i => i.Project)
                .HasForeignKey(i => i.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProjectImage>(e =>
        {
            e.HasIndex(i => new { i.ProjectId, i.SortOrder });
            e.Property(i => i.CaptionSl).HasMaxLength(300);
            e.Property(i => i.CaptionEn).HasMaxLength(300);
            e.HasOne(i => i.MediaAsset)
                .WithMany()
                .HasForeignKey(i => i.MediaAssetId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<PageSection>(e =>
        {
            e.HasIndex(s => s.Key).IsUnique();
            e.Property(s => s.Key).HasMaxLength(64);
            e.Property(s => s.UpdatedBy).HasMaxLength(256);
        });

        builder.Entity<Enquiry>(e =>
        {
            e.HasIndex(q => q.Reference).IsUnique();
            e.Property(q => q.Reference).HasMaxLength(20);
            e.Property(q => q.Category).HasMaxLength(64);
            e.Property(q => q.ItemType).HasMaxLength(64);
            e.Property(q => q.Shape).HasMaxLength(64);
            e.Property(q => q.Status).HasConversion<string>().HasMaxLength(16);
            e.Property(q => q.ContactName).HasMaxLength(200);
            e.Property(q => q.ContactEmail).HasMaxLength(256);
            e.Property(q => q.ContactPhone).HasMaxLength(40);
            e.Property(q => q.ContactTown).HasMaxLength(120);
            e.Property(q => q.Timeframe).HasMaxLength(20);
            e.Property(q => q.Locale).HasMaxLength(5);
            e.HasOne(q => q.SnapshotMedia)
                .WithMany()
                .HasForeignKey(q => q.SnapshotMediaId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
