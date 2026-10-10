using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountIdToAgencyInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "agency_info",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "agency_info",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // Backfill: la fila global existente se asigna a la cuenta del
            // primer owner (misma cuenta compartida del backfill de AddAccountIsolation).
            migrationBuilder.Sql(
                """
                UPDATE agency_info
                SET account_id = (
                    SELECT account_id FROM users
                    WHERE role = 'owner'
                    ORDER BY id
                    LIMIT 1
                )
                WHERE account_id = '00000000-0000-0000-0000-000000000000'
                  AND EXISTS (SELECT 1 FROM users WHERE role = 'owner');

                ALTER TABLE agency_info ALTER COLUMN account_id DROP DEFAULT;
                """);

            migrationBuilder.CreateIndex(
                name: "idx_agency_info_account_id",
                table: "agency_info",
                column: "account_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_agency_info_account_id",
                table: "agency_info");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "agency_info");

            migrationBuilder.AlterColumn<int>(
                name: "id",
                table: "agency_info",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);
        }
    }
}
