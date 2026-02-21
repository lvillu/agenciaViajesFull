using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Infrastructure.Persistance.Configurations;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Provider> Providers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Aplica todas las configuraciones de entidades del assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
