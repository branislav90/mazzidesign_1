using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "cms");

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MediaAssets",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    PathOriginal = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    PathLarge = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    PathMedium = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    PathThumb = table.Column<string>(type: "character varying(260)", maxLength: 260, nullable: false),
                    AltTextSl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AltTextEn = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaAssets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PageSections",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    JsonSl = table.Column<string>(type: "text", nullable: false),
                    JsonEn = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageSections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "cms",
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "cms",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                schema: "cms",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "cms",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                schema: "cms",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "cms",
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "cms",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                schema: "cms",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "cms",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TokenHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "cms",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Enquiries",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Reference = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ItemType = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Shape = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    DimensionsMmJson = table.Column<string>(type: "text", nullable: false),
                    DerivedJson = table.Column<string>(type: "text", nullable: false),
                    MaterialJson = table.Column<string>(type: "text", nullable: false),
                    ExtrasJson = table.Column<string>(type: "text", nullable: false),
                    SnapshotMediaId = table.Column<Guid>(type: "uuid", nullable: true),
                    PhotoIdsJson = table.Column<string>(type: "text", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    ContactTown = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Timeframe = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Locale = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    InternalNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enquiries_MediaAssets_SnapshotMediaId",
                        column: x => x.SnapshotMediaId,
                        principalSchema: "cms",
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TitleSl = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TitleEn = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DescriptionSl = table.Column<string>(type: "text", nullable: false),
                    DescriptionEn = table.Column<string>(type: "text", nullable: false),
                    Species = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Town = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CoverImageId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_MediaAssets_CoverImageId",
                        column: x => x.CoverImageId,
                        principalSchema: "cms",
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProjectImages",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CaptionSl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    CaptionEn = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectImages_MediaAssets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalSchema: "cms",
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProjectImages_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "cms",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                schema: "cms",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                schema: "cms",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                schema: "cms",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                schema: "cms",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                schema: "cms",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "cms",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                schema: "cms",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enquiries_Reference",
                schema: "cms",
                table: "Enquiries",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enquiries_SnapshotMediaId",
                schema: "cms",
                table: "Enquiries",
                column: "SnapshotMediaId");

            migrationBuilder.CreateIndex(
                name: "IX_PageSections_Key",
                schema: "cms",
                table: "PageSections",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImages_MediaAssetId",
                schema: "cms",
                table: "ProjectImages",
                column: "MediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectImages_ProjectId_SortOrder",
                schema: "cms",
                table: "ProjectImages",
                columns: new[] { "ProjectId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CoverImageId",
                schema: "cms",
                table: "Projects",
                column: "CoverImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Slug",
                schema: "cms",
                table: "Projects",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenHash",
                schema: "cms",
                table: "RefreshTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                schema: "cms",
                table: "RefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "Enquiries",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "PageSections",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "ProjectImages",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "RefreshTokens",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetRoles",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "Projects",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "AspNetUsers",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "MediaAssets",
                schema: "cms");
        }
    }
}
