using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SamaBoutique.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryZones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DeliveryZones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nom = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Communes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tarif = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DelaiMinH = table.Column<int>(type: "int", nullable: false),
                    DelaiMaxH = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FreeFrom = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Ordre = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryZones", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryZones");
        }
    }
}
