using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleProviders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "idx_sales_provider_id",
                table: "sales",
                newName: "IX_sales_provider_id");

            migrationBuilder.AlterColumn<int>(
                name: "provider_id",
                table: "sales",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateTable(
                name: "sale_providers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sale_id = table.Column<int>(type: "integer", nullable: false),
                    provider_id = table.Column<int>(type: "integer", nullable: false),
                    reservation_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sale_providers", x => x.id);
                    table.ForeignKey(
                        name: "FK_sale_providers_providers_provider_id",
                        column: x => x.provider_id,
                        principalTable: "providers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sale_providers_sales_sale_id",
                        column: x => x.sale_id,
                        principalTable: "sales",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
                INSERT INTO sale_providers (sale_id, provider_id, reservation_number, created_at)
                SELECT id, provider_id, reservation_number, NOW()
                FROM sales
                WHERE provider_id IS NOT NULL;
            ");

            migrationBuilder.CreateIndex(
                name: "idx_sale_providers_provider_id",
                table: "sale_providers",
                column: "provider_id");

            migrationBuilder.CreateIndex(
                name: "idx_sale_providers_sale_id",
                table: "sale_providers",
                column: "sale_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE sales s
                SET provider_id = sp.provider_id,
                    reservation_number = sp.reservation_number
                FROM (
                    SELECT DISTINCT ON (sale_id) sale_id, provider_id, reservation_number
                    FROM sale_providers
                    ORDER BY sale_id, id
                ) sp
                WHERE s.id = sp.sale_id;
            ");

            migrationBuilder.DropTable(
                name: "sale_providers");

            migrationBuilder.RenameIndex(
                name: "IX_sales_provider_id",
                table: "sales",
                newName: "idx_sales_provider_id");

            migrationBuilder.AlterColumn<int>(
                name: "provider_id",
                table: "sales",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
