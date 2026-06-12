using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CmsCore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MediaAssets",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    PathOriginal = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    PathLarge = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    PathMedium = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    PathThumb = table.Column<string>(type: "nvarchar(260)", maxLength: 260, nullable: false),
                    AltTextSl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AltTextEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    JsonSl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageSections", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Enquiries",
                schema: "cms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ItemType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Shape = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    DimensionsMmJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DerivedJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaterialJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtrasJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SnapshotMediaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PhotoIdsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ContactPhone = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ContactTown = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Timeframe = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Locale = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    InternalNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TitleSl = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionSl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Species = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Town = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CoverImageId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
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
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CaptionSl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    CaptionEn = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
                name: "Projects",
                schema: "cms");

            migrationBuilder.DropTable(
                name: "MediaAssets",
                schema: "cms");
        }
    }
}
