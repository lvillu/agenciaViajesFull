using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("payments");

            // Clave primaria
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Relaciones
            builder.Property(p => p.SaleId)
                .HasColumnName("sale_id")
                .IsRequired();

            // La relación se configura desde SaleConfiguration

            // Propiedades
            builder.Property(p => p.PaymentDate)
                .HasColumnName("payment_date")
                .IsRequired();

            builder.Property(p => p.Amount)
                .HasColumnName("amount")
                .HasPrecision(12, 2)
                .IsRequired();

            builder.Property(p => p.ExchangeRate)
                .HasColumnName("exchange_rate")
                .HasPrecision(10, 4)
                .IsRequired(false);

            builder.Property(p => p.AmountMXN)
                .HasColumnName("amount_mxn")
                .HasPrecision(12, 2)
                .IsRequired(false);

            builder.Property(p => p.Notes)
                .HasColumnName("notes")
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(p => p.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()")
                .IsRequired();

            builder.Property(p => p.ModifiedAt)
                .HasColumnName("modified_at")
                .IsRequired(false);

            // Índices
            builder.HasIndex(p => p.SaleId)
                .HasDatabaseName("idx_payments_sale_id");

            builder.HasIndex(p => p.PaymentDate)
                .HasDatabaseName("idx_payments_payment_date");
        }
    }
}
