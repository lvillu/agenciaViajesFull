using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Nombre de la tabla en PostgreSQL (snake_case)
            builder.ToTable("users");

            // Clave primaria
            builder.HasKey(u => u.Id);
            builder.Property(u => u.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Propiedades
            builder.Property(u => u.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(u => u.LastName)
                .HasColumnName("last_name")
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(u => u.UserName)
                .HasColumnName("user_name")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(u => u.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(u => u.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(u => u.RefreshToken)
                .HasColumnName("refresh_token")
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(u => u.RefreshTokenExpiryTime)
                .HasColumnName("refresh_token_expiry_time")
                .IsRequired(false);

            builder.Property(u => u.UserIconUrl)
                .HasColumnName("user_icon_url")
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(u => u.Active)
                .HasColumnName("active")
                .HasDefaultValue(true)
                .IsRequired();

            builder.Property(u => u.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()")
                .IsRequired();

            // Account isolation
            builder.Property(u => u.AccountId)
                .HasColumnName("account_id")
                .IsRequired();

            builder.Property(u => u.Role)
                .HasColumnName("role")
                .HasMaxLength(50)
                .HasDefaultValue("owner")
                .IsRequired();

            builder.Property(u => u.ParentUserId)
                .HasColumnName("parent_user_id")
                .IsRequired(false);

            // Self-referencing FK for sub-accounts
            builder.HasOne(u => u.ParentUser)
                .WithMany()
                .HasForeignKey(u => u.ParentUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("idx_users_email");

            builder.HasIndex(u => u.UserName)
                .IsUnique()
                .HasDatabaseName("idx_users_username");

            builder.HasIndex(u => u.AccountId)
                .HasDatabaseName("idx_users_account_id");
        }
    }
}
