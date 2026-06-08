using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SamaBoutique.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPrixPromo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PrixPromo",
                table: "Products",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrixPromo",
                table: "Products");
        }
    }
}
