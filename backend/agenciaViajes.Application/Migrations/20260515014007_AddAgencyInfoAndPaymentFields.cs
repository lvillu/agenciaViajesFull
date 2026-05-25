using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class AddAgencyInfoAndPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "folio_number",
                table: "payments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "payment_type",
                table: "payments",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<decimal>(
                name: "transaction_fee",
                table: "payments",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "agency_info",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    state = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    zip_code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sectur_reg = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    facebook = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    instagram = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    logo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agency_info", x => x.id);
                });

            // Asignar folio_number único a registros existentes antes de crear el índice único
            migrationBuilder.Sql(@"
                UPDATE payments
                SET folio_number = sub.row_num
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS row_num
                    FROM payments
                ) sub
                WHERE payments.id = sub.id;
            ");

            migrationBuilder.Sql(@"
                UPDATE payments
                SET payment_type = CASE
                    WHEN payment_rank = 1 THEN 1
                    WHEN payment_rank = payment_count THEN 3
                    ELSE 2
                END
                FROM (
                    SELECT
                        id,
                        ROW_NUMBER() OVER (PARTITION BY sale_id ORDER BY payment_date, id) AS payment_rank,
                        COUNT(*) OVER (PARTITION BY sale_id) AS payment_count
                    FROM payments
                ) ranked_payments
                WHERE payments.id = ranked_payments.id;
            ");

            migrationBuilder.Sql(@"
                CREATE SEQUENCE IF NOT EXISTS payments_folio_number_seq
                AS integer
                START WITH 1
                INCREMENT BY 1;

                DO $$
                DECLARE
                    v_max INTEGER;
                BEGIN
                    SELECT MAX(folio_number) INTO v_max FROM payments;
                    IF v_max IS NOT NULL AND v_max >= 1 THEN
                        PERFORM setval('payments_folio_number_seq', v_max);
                    END IF;
                END $$;

                ALTER TABLE payments
                ALTER COLUMN folio_number
                SET DEFAULT nextval('payments_folio_number_seq');
            ");

            migrationBuilder.CreateIndex(
                name: "idx_payments_folio_number",
                table: "payments",
                column: "folio_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agency_info");

            migrationBuilder.DropIndex(
                name: "idx_payments_folio_number",
                table: "payments");

            migrationBuilder.Sql(@"
                ALTER TABLE payments
                ALTER COLUMN folio_number
                DROP DEFAULT;

                DROP SEQUENCE IF EXISTS payments_folio_number_seq;
            ");

            migrationBuilder.DropColumn(
                name: "folio_number",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "payment_type",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "transaction_fee",
                table: "payments");
        }
    }
}
