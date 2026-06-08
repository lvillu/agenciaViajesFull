using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class AddFolioStartToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_payments_folio_number",
                table: "payments");

            migrationBuilder.AddColumn<int>(
                name: "folio_start",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "idx_payments_account_folio",
                table: "payments",
                columns: new[] { "account_id", "folio_number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_payments_account_folio",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "folio_start",
                table: "users");

            migrationBuilder.CreateIndex(
                name: "idx_payments_folio_number",
                table: "payments",
                column: "folio_number",
                unique: true);
        }
    }
}
