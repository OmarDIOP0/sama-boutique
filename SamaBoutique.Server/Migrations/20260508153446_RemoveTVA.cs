using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SamaBoutique.Server.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTVA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TvaPct",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TvaPct",
                table: "Products",
                type: "decimal(5,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
