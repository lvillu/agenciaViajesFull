using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace agenciaViajes.Application.Infrastructure.Persistance.Configurations
{
    public class AgencyInfoConfiguration : IEntityTypeConfiguration<AgencyInfo>
    {
        public void Configure(EntityTypeBuilder<AgencyInfo> builder)
        {
            builder.ToTable("agency_info");

            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                .HasColumnName("id")
                .ValueGeneratedNever(); // Id fijo = 1 (singleton)

            builder.Property(a => a.Name)
                .HasColumnName("name")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(a => a.Address)
                .HasColumnName("address")
                .HasMaxLength(300)
                .IsRequired(false);

            builder.Property(a => a.City)
                .HasColumnName("city")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(a => a.State)
                .HasColumnName("state")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(a => a.ZipCode)
                .HasColumnName("zip_code")
                .HasMaxLength(10)
                .IsRequired(false);

            builder.Property(a => a.Phone)
                .HasColumnName("phone")
                .HasMaxLength(30)
                .IsRequired(false);

            builder.Property(a => a.Email)
                .HasColumnName("email")
                .HasMaxLength(200)
                .IsRequired(false);

            builder.Property(a => a.SecturReg)
                .HasColumnName("sectur_reg")
                .HasMaxLength(50)
                .IsRequired(false);

            builder.Property(a => a.Facebook)
                .HasColumnName("facebook")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(a => a.Instagram)
                .HasColumnName("instagram")
                .HasMaxLength(100)
                .IsRequired(false);

            builder.Property(a => a.LogoUrl)
                .HasColumnName("logo_url")
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(a => a.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
        }
    }
}
