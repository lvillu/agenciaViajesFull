using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLegacySaleProviderColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Backfill: las ventas de la era pre-multi-proveedor guardaban el
            // proveedor en sales.provider_id/reservation_number. Se migran a
            // sale_providers antes de eliminar las columnas (idempotente).
            migrationBuilder.Sql(
                """
                INSERT INTO sale_providers (sale_id, provider_id, reservation_number, created_at)
                SELECT id, provider_id, reservation_number, NOW()
                FROM sales
                WHERE provider_id IS NOT NULL
                  AND NOT EXISTS (SELECT 1 FROM sale_providers sp WHERE sp.sale_id = sales.id);
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_sales_providers_provider_id",
                table: "sales");

            migrationBuilder.DropIndex(
                name: "idx_sales_reservation_number",
                table: "sales");

            migrationBuilder.DropIndex(
                name: "IX_sales_provider_id",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "provider_id",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "reservation_number",
                table: "sales");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "provider_id",
                table: "sales",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "reservation_number",
                table: "sales",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            // Rollback best-effort: restaura las columnas legacy desde el primer
            // proveedor de cada venta (los proveedores son inmutables, así que
            // equivale al estado original en la práctica).
            migrationBuilder.Sql(
                """
                UPDATE sales s
                SET provider_id = sp.provider_id,
                    reservation_number = sp.reservation_number
                FROM (
                    SELECT DISTINCT ON (sale_id) sale_id, provider_id, reservation_number
                    FROM sale_providers
                    ORDER BY sale_id, id
                ) sp
                WHERE sp.sale_id = s.id;
                """);

            migrationBuilder.CreateIndex(
                name: "idx_sales_reservation_number",
                table: "sales",
                column: "reservation_number");

            migrationBuilder.CreateIndex(
                name: "IX_sales_provider_id",
                table: "sales",
                column: "provider_id");

            migrationBuilder.AddForeignKey(
                name: "FK_sales_providers_provider_id",
                table: "sales",
                column: "provider_id",
                principalTable: "providers",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
