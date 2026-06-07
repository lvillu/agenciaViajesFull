using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Persistance.Configurations;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Context
{
    public class AppDbContext : DbContext
    {
        private readonly IAccountService _accountService;

        public AppDbContext(DbContextOptions<AppDbContext> options, IAccountService accountService) : base(options)
        {
            _accountService = accountService;
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Provider> Providers { get; set; } = null!;
        public DbSet<Client> Clients { get; set; } = null!;
        public DbSet<Sale> Sales { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<AgencyInfo> AgencyInfo { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Aplica todas las configuraciones de entidades del assembly
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);

            // Global query filters for account isolation
            // These automatically scope all queries to the current account
            // User entity is NOT filtered because login needs to search across all accounts
            modelBuilder.Entity<Client>().HasQueryFilter(e => e.AccountId == _accountService.AccountId);
            modelBuilder.Entity<Provider>().HasQueryFilter(e => e.AccountId == _accountService.AccountId);
            modelBuilder.Entity<Sale>().HasQueryFilter(e => e.AccountId == _accountService.AccountId);
            modelBuilder.Entity<Payment>().HasQueryFilter(e => e.AccountId == _accountService.AccountId);

            base.OnModelCreating(modelBuilder);
        }
    }
}
