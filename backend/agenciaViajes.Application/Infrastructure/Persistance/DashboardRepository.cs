using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly AppDbContext _context;

        public DashboardRepository(AppDbContext context)
        {
            _context = context;
        }

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
                    && s.TravelDate.Year == today.Year
                    && s.TravelDate.Month == today.Month
                    && s.ProfitPercentage.HasValue)
                .ToListAsync(cancellationToken);

            decimal totalProfit = 0;
            foreach (var sale in sales)
            {
                var amountMXN = GetAmountInMXN(sale);
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
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active
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
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active
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
        public async Task<List<Sale>> GetSalesLast12MonthsAsync(CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow;
            var startDate = DateTime.SpecifyKind(new DateTime(today.Year, today.Month, 1).AddMonths(-11), DateTimeKind.Utc);

            return await _context.Sales
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .Where(s => s.Active && s.CreatedAt >= startDate)
                .ToListAsync(cancellationToken);
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
