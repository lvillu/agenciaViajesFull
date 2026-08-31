using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class SaleProviderConfiguration : IEntityTypeConfiguration<SaleProvider>
    {
        public void Configure(EntityTypeBuilder<SaleProvider> builder)
        {
            builder.ToTable("sale_providers");

            builder.HasKey(sp => sp.Id);

            builder.Property(sp => sp.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(sp => sp.SaleId)
                .HasColumnName("sale_id")
                .IsRequired();

            builder.Property(sp => sp.ProviderId)
                .HasColumnName("provider_id")
                .IsRequired();

            builder.Property(sp => sp.ReservationNumber)
                .HasColumnName("reservation_number")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(sp => sp.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()")
                .IsRequired();

            builder.HasOne(sp => sp.Sale)
                .WithMany(s => s.SaleProviders)
                .HasForeignKey(sp => sp.SaleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sp => sp.Provider)
                .WithMany()
                .HasForeignKey(sp => sp.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(sp => sp.SaleId)
                .HasDatabaseName("idx_sale_providers_sale_id");

            builder.HasIndex(sp => sp.ProviderId)
                .HasDatabaseName("idx_sale_providers_provider_id");
        }
    }
}
