using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class SaleConfiguration : IEntityTypeConfiguration<Sale>
    {
        public void Configure(EntityTypeBuilder<Sale> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("sales");

            // Clave primaria
            builder.HasKey(s => s.Id);
            builder.Property(s => s.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Relaciones
            builder.Property(s => s.ClientId)
                .HasColumnName("client_id")
                .IsRequired();

            builder.Property(s => s.ProviderId)
                .HasColumnName("provider_id")
                .IsRequired(false);

            // Configurar relaciones de navegación
            builder.HasOne(s => s.Client)
                .WithMany()
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Provider)
                .WithMany()
                .HasForeignKey(s => s.ProviderId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Payments)
                .WithOne(p => p.Sale)
                .HasForeignKey(p => p.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            // Propiedades
            builder.Property(s => s.ReservationNumber)
                .HasColumnName("reservation_number")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(s => s.Description)
                .HasColumnName("description")
                .HasMaxLength(1000)
                .IsRequired(false);

            builder.Property(s => s.TotalAmount)
                .HasColumnName("total_amount")
                .HasPrecision(12, 2)
                .IsRequired();

            builder.Property(s => s.IsDollar)
                .HasColumnName("is_dollar")
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(s => s.ProfitPercentage)
                .HasColumnName("profit_percentage")
                .HasPrecision(5, 2)
                .IsRequired(false);

            builder.Property(s => s.RequiredDeposit)
                .HasColumnName("required_deposit")
                .HasPrecision(12, 2)
                .IsRequired(false);

            builder.Property(s => s.FinalPaymentDueDate)
                .HasColumnName("final_payment_due_date")
                .IsRequired(false);

            builder.Property(s => s.TravelDate)
                .HasColumnName("travel_date")
                .IsRequired();

            builder.Property(s => s.ReturnDate)
                .HasColumnName("return_date")
                .IsRequired(false);

            builder.Property(s => s.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("Pendiente")
                .IsRequired(false);

            builder.Property(s => s.Active)
                .HasColumnName("active")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(s => s.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()")
                .IsRequired();

            builder.Property(s => s.ModifiedAt)
                .HasColumnName("modified_at")
                .IsRequired(false);

            // Índices
            builder.HasIndex(s => s.ClientId)
                .HasDatabaseName("idx_sales_client_id");

            builder.HasIndex(s => s.ReservationNumber)
                .HasDatabaseName("idx_sales_reservation_number");

            builder.HasIndex(s => s.TravelDate)
                .HasDatabaseName("idx_sales_travel_date");

            builder.HasIndex(s => s.Active)
                .HasDatabaseName("idx_sales_active");

            builder.HasIndex(s => s.Status)
                .HasDatabaseName("idx_sales_status");
        }
    }
}
