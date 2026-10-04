using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("refresh_tokens");

            // Clave primaria
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            builder.Property(r => r.UserId)
                .HasColumnName("user_id")
                .IsRequired();

            builder.Property(r => r.TokenHash)
                .HasColumnName("token_hash")
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(r => r.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            builder.Property(r => r.ExpiresAt)
                .HasColumnName("expires_at")
                .IsRequired();

            builder.Property(r => r.IsRevoked)
                .HasColumnName("is_revoked")
                .HasDefaultValue(false)
                .IsRequired();

            // Relación con el usuario (multi-dispositivo: N tokens por usuario)
            builder.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Índices
            builder.HasIndex(r => r.TokenHash)
                .IsUnique()
                .HasDatabaseName("idx_refresh_tokens_token_hash");

            builder.HasIndex(r => r.UserId)
                .HasDatabaseName("idx_refresh_tokens_user_id");
        }
    }
}
