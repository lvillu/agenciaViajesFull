using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropSequence(
                name: "payments_folio_number_seq");

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "users",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<int>(
                name: "parent_user_id",
                table: "users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "owner");

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "sales",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "providers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "payments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "account_id",
                table: "clients",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.Sql(
                """
                DO $$
                DECLARE
                    shared_account_id uuid := md5(random()::text || clock_timestamp()::text)::uuid;
                BEGIN
                    UPDATE users SET account_id = shared_account_id WHERE account_id = '00000000-0000-0000-0000-000000000000';
                    UPDATE sales SET account_id = shared_account_id WHERE account_id = '00000000-0000-0000-0000-000000000000';
                    UPDATE providers SET account_id = shared_account_id WHERE account_id = '00000000-0000-0000-0000-000000000000';
                    UPDATE payments SET account_id = shared_account_id WHERE account_id = '00000000-0000-0000-0000-000000000000';
                    UPDATE clients SET account_id = shared_account_id WHERE account_id = '00000000-0000-0000-0000-000000000000';
                END $$;

                ALTER TABLE users ALTER COLUMN account_id DROP DEFAULT;
                ALTER TABLE sales ALTER COLUMN account_id DROP DEFAULT;
                ALTER TABLE providers ALTER COLUMN account_id DROP DEFAULT;
                ALTER TABLE payments ALTER COLUMN account_id DROP DEFAULT;
                ALTER TABLE clients ALTER COLUMN account_id DROP DEFAULT;
                """);

            migrationBuilder.CreateIndex(
                name: "idx_users_account_id",
                table: "users",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_parent_user_id",
                table: "users",
                column: "parent_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_sales_account_id",
                table: "sales",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "idx_providers_account_id",
                table: "providers",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "idx_payments_account_id",
                table: "payments",
                column: "account_id");

            migrationBuilder.CreateIndex(
                name: "idx_clients_account_id",
                table: "clients",
                column: "account_id");

            migrationBuilder.AddForeignKey(
                name: "FK_users_users_parent_user_id",
                table: "users",
                column: "parent_user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_users_parent_user_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "idx_users_account_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_parent_user_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "idx_sales_account_id",
                table: "sales");

            migrationBuilder.DropIndex(
                name: "idx_providers_account_id",
                table: "providers");

            migrationBuilder.DropIndex(
                name: "idx_payments_account_id",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "idx_clients_account_id",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "parent_user_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "role",
                table: "users");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "providers");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "account_id",
                table: "clients");

            migrationBuilder.CreateSequence<int>(
                name: "payments_folio_number_seq");
        }
    }
}
