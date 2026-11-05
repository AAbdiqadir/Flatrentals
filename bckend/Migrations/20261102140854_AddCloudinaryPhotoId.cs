using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace bckend.Migrations
{
    /// <inheritdoc />
    public partial class AddCloudinaryPhotoId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "photoId",
                table: "FlatImages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "photoId",
                table: "FlatImages");
        }
    }
}
