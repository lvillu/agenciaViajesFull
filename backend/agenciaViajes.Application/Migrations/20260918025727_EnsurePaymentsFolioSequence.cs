using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class EnsurePaymentsFolioSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Migración defensiva: en BDs creadas desde cero la secuencia ya la crea
            // 20260526193300_AddPaymentsFolioNumberSequence, pero en volúmenes antiguos
            // la secuencia puede faltar (ver 42P01 en payments_folio_number_seq).
            // Este bloque es idempotente y sincroniza el valor con el folio máximo real.
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_class WHERE relname = 'payments_folio_number_seq' AND relkind = 'S'
                    ) THEN
                        CREATE SEQUENCE payments_folio_number_seq START WITH 1;
                    END IF;
                    PERFORM setval(
                        'payments_folio_number_seq',
                        GREATEST(
                            (SELECT COALESCE(MAX(folio_number), 0) FROM payments),
                            (SELECT last_value FROM payments_folio_number_seq)
                        ),
                        true
                    );
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No se elimina la secuencia en Down para no perder la numeración de folios.
        }
    }
}
