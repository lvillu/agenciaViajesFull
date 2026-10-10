using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace agenciaViajes.Application.Migrations
{
    /// <inheritdoc />
    public partial class FixAgencyInfoIdentitySequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // En BDs con filas previas al identity (Id fijo = 1), la secuencia
            // arranca en 1 y el primer INSERT por cuenta choca por PK.
            // Se avanza la secuencia por encima del MAX(id) existente.
            // Además se asignan las filas huérfanas (account Empty) a la
            // cuenta del primer owner, si existe.
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

                SELECT setval('agency_info_id_seq', (SELECT COALESCE(MAX(id), 1) FROM agency_info));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
