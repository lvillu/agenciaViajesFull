using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IDashboardRepository
    {
        // Cards
        Task<decimal> GetEstimatedProfitCurrentMonthAsync(CancellationToken cancellationToken = default);
        Task<List<Sale>> GetPendingSettlementSalesCurrentMonthAsync(CancellationToken cancellationToken = default);
        Task<List<Sale>> GetNearCancellationSalesAsync(int daysBeforeCancellation = 5, CancellationToken cancellationToken = default);

        // Charts
        Task<List<Sale>> GetSalesLast12MonthsAsync(CancellationToken cancellationToken = default);
    }
}
