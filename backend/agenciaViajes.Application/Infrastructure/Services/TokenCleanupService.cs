using agenciaViajes.Application.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace agenciaViajes.Application.Infrastructure.Services
{
    /// <summary>
    /// Purga periódica de refresh tokens vencidos (Fase 4). Sin esto la tabla
    /// crece sin cota: la rotación deja filas revocadas para siempre.
    /// Primera purga al minuto de arrancar, luego cada 24h. Conserva 7 días
    /// de gracia para auditoría.
    /// </summary>
    public class TokenCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopes;
        private readonly ILogger<TokenCleanupService> _logger;

        public TokenCleanupService(IServiceScopeFactory scopes, ILogger<TokenCleanupService> logger)
        {
            _scopes = scopes;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }

            using var timer = new PeriodicTimer(TimeSpan.FromHours(24));
            do
            {
                await PurgeOnce(stoppingToken);
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        internal async Task<int> PurgeOnce(CancellationToken cancellationToken)
        {
            using var scope = _scopes.CreateScope();
            var repository = scope.ServiceProvider.GetRequiredService<IAuthRepository>();
            var purged = await repository.PurgeExpiredTokensAsync(
                DateTime.UtcNow.AddDays(-7), cancellationToken);

            if (purged > 0)
            {
                _logger.LogInformation("Refresh tokens vencidos purgados: {Count}", purged);
            }

            return purged;
        }
    }
}
