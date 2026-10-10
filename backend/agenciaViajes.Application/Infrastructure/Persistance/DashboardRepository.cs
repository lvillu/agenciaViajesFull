using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly AppDbContext _context;
        private readonly IAccountService _accountService;
        private readonly IMemoryCache _cache;

        public DashboardRepository(AppDbContext context, IAccountService accountService, IMemoryCache cache)
        {
            _context = context;
            _accountService = accountService;
            _cache = cache;
        }

        // Tenant actual resuelto desde el JWT (claim accountId).
        private Guid AccountId => _accountService.AccountId;

        /// <summary>
        /// Ganancias estimadas para ventas cuya fecha de viaje cae en el mes en curso.
        /// Las ventas en dólares se convierten a MXN usando el promedio de tipos de cambio de sus pagos.
        /// </summary>
        public async Task<decimal> GetEstimatedProfitCurrentMonthAsync(CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow;

            var sales = await _context.Sales
                .Include(s => s.Payments)
                .Where(s => s.Active
                    && s.AccountId == AccountId
                    && s.TravelDate.Year == today.Year
                    && s.TravelDate.Month == today.Month
                    && s.ProfitPercentage.HasValue)
                .ToListAsync(cancellationToken);

            decimal totalProfit = 0;
            foreach (var sale in sales)
            {
                var amountMXN = GetAmountInMXN(sale);
                if (sale.TotalAmount > 0) amountMXN *= sale.CommissionBase / sale.TotalAmount;
                totalProfit += amountMXN * sale.ProfitPercentage!.Value / 100;
            }

            return Math.Round(totalProfit, 2);
        }

        /// <summary>
        /// Reservas cuya fecha límite de pago final vence en el mes en curso y que no han sido liquidadas.
        /// </summary>
        public async Task<List<Sale>> GetPendingSettlementSalesCurrentMonthAsync(CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow;

            var sales = await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.SaleProviders)
                    .ThenInclude(sp => sp.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active
                    && s.AccountId == AccountId
                    && s.FinalPaymentDueDate.HasValue
                    && s.FinalPaymentDueDate.Value.Year == today.Year
                    && s.FinalPaymentDueDate.Value.Month == today.Month)
                .OrderBy(s => s.FinalPaymentDueDate)
                .ToListAsync(cancellationToken);

            // Filtrar las que aún no están liquidadas
            return sales
                .Where(s => s.Payments == null || s.Payments.Sum(p => p.Amount) < s.TotalAmount)
                .ToList();
        }

        /// <summary>
        /// Reservas cuya fecha límite de pago vence dentro de los próximos N días y que no han sido liquidadas.
        /// </summary>
        public async Task<List<Sale>> GetNearCancellationSalesAsync(int daysBeforeCancellation = 5, CancellationToken cancellationToken = default)
        {
            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            var limitDate = DateTime.SpecifyKind(today.AddDays(daysBeforeCancellation), DateTimeKind.Utc);

            var sales = await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.SaleProviders)
                    .ThenInclude(sp => sp.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active
                    && s.AccountId == AccountId
                    && s.FinalPaymentDueDate.HasValue
                    && s.FinalPaymentDueDate.Value.Date >= today
                    && s.FinalPaymentDueDate.Value.Date <= limitDate)
                .OrderBy(s => s.FinalPaymentDueDate)
                .ToListAsync(cancellationToken);

            // Omitir las que ya están liquidadas
            return sales
                .Where(s => s.Payments == null || s.Payments.Sum(p => p.Amount) < s.TotalAmount)
                .ToList();
        }

        /// <summary>
        /// Ventas activas de los últimos 12 meses (desde el inicio del mes actual menos 11 meses).
        /// Incluye pagos para la conversión de tipo de cambio.
        /// </summary>
        /// <summary>
        /// Ventas activas de los últimos 12 meses. Los 3 endpoints de charts
        /// consumen este mismo método: se cachea 60s por cuenta para no
        /// repetir la carga pesada en cada gráfico.
        /// </summary>
        public async Task<List<Sale>> GetSalesLast12MonthsAsync(CancellationToken cancellationToken = default)
        {
            var cacheKey = $"dashboard-12m-{AccountId}";
            if (_cache.TryGetValue(cacheKey, out List<Sale>? cached) && cached is not null)
            {
                return cached;
            }

            var today = DateTime.UtcNow;
            var startDate = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1).AddMonths(-11), DateTimeKind.Utc);
            var sales = await _context.Sales
                .AsNoTracking()
                .Include(s => s.SaleProviders)
                    .ThenInclude(sp => sp.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active && s.AccountId == AccountId &&
s.CreatedAt >= startDate)
                .ToListAsync(cancellationToken);

            _cache.Set(cacheKey, sales, TimeSpan.FromSeconds(60));
            return sales;
        }

        // ─────────────────────────────────────────────────────────
        // Helper: convertir monto a MXN usando promedio de tipos
        // de cambio de los pagos de la venta.
        // ─────────────────────────────────────────────────────────
        private static decimal GetAmountInMXN(Sale sale)
        {
            if (!sale.IsDollar) return sale.TotalAmount;

            var rates = sale.Payments?
                .Where(p => p.ExchangeRate.HasValue && p.ExchangeRate > 0)
                .Select(p => p.ExchangeRate!.Value)
                .ToList();

            if (rates == null || rates.Count == 0)
                return sale.TotalAmount; // Sin tipo de cambio disponible, se toma tal cual

            return sale.TotalAmount * rates.Average();
        }
    }
}
