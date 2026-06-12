using System.Text;
using System.Threading.RateLimiting;
using Api.Auth;
using Api.Seed;
using Api.Services;
using Domain.Entities;
using FluentValidation;
using Infrastructure;
using Infrastructure.Email;
using Infrastructure.Media;
using Infrastructure.Persistence;
using Infrastructure.Storage;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, config) =>
        config.ReadFrom.Configuration(context.Configuration).WriteTo.Console());

    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services
        .AddIdentityCore<AdminUser>(options =>
        {
            options.Password.RequiredLength = 10;
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<AppDbContext>();

    var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
    builder.Services.Configure<JwtOptions>(jwtSection);
    var jwt = jwtSection.Get<JwtOptions>()
        ?? throw new InvalidOperationException("Missing Jwt configuration section.");

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwt.Issuer,
                ValidateAudience = true,
                ValidAudience = jwt.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
                ClockSkew = TimeSpan.FromSeconds(30),
            };
        });
    builder.Services.AddAuthorization();
    builder.Services.AddScoped<JwtTokenService>();

    builder.Services.AddControllers();
    builder.Services.AddProblemDetails();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // CMS services: storage, media pipeline, email, URL building, validation, revalidation.
    var storageRoot = builder.Configuration["Storage:Root"] is { Length: > 0 } configuredRoot
        ? Path.GetFullPath(configuredRoot, builder.Environment.ContentRootPath)
        : Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "storage"));
    builder.Services.AddSingleton<IFileStorage>(new LocalFileStorage(storageRoot));
    builder.Services.AddSingleton<MediaProcessingService>();
    builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
    builder.Services.AddSingleton<EnquiryEmailSender>();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddScoped<MediaUrlBuilder>();
    builder.Services.AddHttpClient();
    builder.Services.AddSingleton<FrontendRevalidator>();
    builder.Services.AddValidatorsFromAssemblyContaining<Program>();

    // 5 requests/minute/IP on the anonymous enquiry endpoints.
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.AddPolicy("enquiries", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                }));
    });

    builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
        policy.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [])
            .AllowAnyHeader()
            .AllowAnyMethod()));

    builder.Services.AddHealthChecks();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        await ApplyMigrationsAndSeedAsync(app);
    }

    app.UseSerilogRequestLogging();

    // Uploaded media: backend/storage served at /uploads (absolute URLs built by MediaUrlBuilder).
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(storageRoot),
        RequestPath = "/uploads",
    });

    app.UseCors();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

static async Task ApplyMigrationsAndSeedAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
    }

    var seedLogger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("CmsSeeder");
    await CmsSeeder.SeedAsync(db, seedLogger);

    var email = app.Configuration["Admin:Email"];
    var password = app.Configuration["Admin:Password"];
    if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
    {
        return;
    }

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AdminUser>>();
    if (await userManager.FindByEmailAsync(email) is null)
    {
        var admin = new AdminUser
        {
            UserName = email,
            Email = email,
            DisplayName = "Workshop Admin",
            EmailConfirmed = true,
        };
        var result = await userManager.CreateAsync(admin, password);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, "Admin");
            Log.Information("Seeded admin user {Email}", email);
        }
        else
        {
            Log.Warning("Admin seed failed: {Errors}",
                string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }
}

// Exposed for WebApplicationFactory-based integration tests.
public partial class Program;
