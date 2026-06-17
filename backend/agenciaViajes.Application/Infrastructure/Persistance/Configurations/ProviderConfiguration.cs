using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class ProviderConfiguration : IEntityTypeConfiguration<Provider>
    {
        public void Configure(EntityTypeBuilder<Provider> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("providers");

            // Clave primaria
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Propiedades
            builder.Property(p => p.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(p => p.Acronym)
                .HasColumnName("acronym")
                .HasMaxLength(10)
                .IsRequired();

            builder.Property(p => p.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(p => p.Phone)
                .HasColumnName("phone")
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(p => p.ProviderContactName)
                .HasColumnName("provider_contact_name")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(p => p.DepositPercentage)
                .HasColumnName("deposit_percentage")
                .HasPrecision(5, 2)
                .IsRequired(false);

            builder.Property(p => p.ProfitPercentage)
                .HasColumnName("profit_percentage")
                .HasPrecision(5, 2)
                .IsRequired(false);
            builder.Property(p => p.FinalPaymentDaysBefore)
                .HasColumnName("final_payment_days_before")
                .IsRequired(false);

            builder.Property(p => p.Active)
                .HasColumnName("active")
                .HasDefaultValue(true)
                .IsRequired();

            // Account isolation
            builder.Property(p => p.AccountId)
                .HasColumnName("account_id")
                .IsRequired();

            // Índices
            builder.HasIndex(p => p.Name)
                .HasDatabaseName("idx_providers_name");

            builder.HasIndex(p => p.Email)
                .HasDatabaseName("idx_providers_email");

            builder.HasIndex(p => p.AccountId)
                .HasDatabaseName("idx_providers_account_id");
        }
    }
}
