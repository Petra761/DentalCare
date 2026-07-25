using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DentalCare.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleEventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleEventId",
                table: "Cita",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleEventId",
                table: "Cita");
        }
    }
}
