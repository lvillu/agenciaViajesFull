using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class ClientConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("clients");

            // Clave primaria
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Propiedades obligatorias
            builder.Property(c => c.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(c => c.LastName)
                .HasColumnName("last_name")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(c => c.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(c => c.Phone)
                .HasColumnName("phone")
                .HasMaxLength(20)
                .IsRequired();

            // Propiedades opcionales
            builder.Property(c => c.Address)
                .HasColumnName("address")
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(c => c.BirthDate)
                .HasColumnName("birth_date")
                .IsRequired(false);

            builder.Property(c => c.Active)
                .HasColumnName("active")
                .HasDefaultValue(true)
                .IsRequired();

            // Account isolation
            builder.Property(c => c.AccountId)
                .HasColumnName("account_id")
                .IsRequired();

            // Índices
            builder.HasIndex(c => c.Email)
                .HasDatabaseName("idx_clients_email");

            builder.HasIndex(c => c.LastName)
                .HasDatabaseName("idx_clients_last_name");

            builder.HasIndex(c => c.Active)
                .HasDatabaseName("idx_clients_active");

            builder.HasIndex(c => c.AccountId)
                .HasDatabaseName("idx_clients_account_id");
        }
    }
}
