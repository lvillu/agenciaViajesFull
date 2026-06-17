using agenciaViajes.Application.Domain.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace agenciaViajes.Application.Infrastructure.Context
{
    /// <summary>
    /// Design-time factory for EF Core migrations.
    /// Required because AppDbContext now depends on IAccountService (scoped).
    /// </summary>
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            // Try to get connection string from environment variable first, then fallback
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__IbarraTravelDB")
                ?? "Host=localhost;Database=IbarraTravelDB;Username=postgres;Password=postgres";

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            // Use a no-op AccountService for design-time (migrations)
            return new AppDbContext(optionsBuilder.Options, new DesignTimeAccountService());
        }

        /// <summary>
        /// No-op implementation that returns Guid.Empty for design-time scenarios.
        /// Prevents the global query filter from breaking migration generation.
        /// </summary>
        private class DesignTimeAccountService : IAccountService
        {
            public Guid AccountId => Guid.Empty;
            public int UserId => 0;
            public string Role => "owner";
            public string UserName => string.Empty;
        }
    }
}
