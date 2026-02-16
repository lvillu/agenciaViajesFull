using agenciaViajes.Application.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
    }
}
