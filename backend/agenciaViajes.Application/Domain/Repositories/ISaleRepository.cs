using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface ISaleRepository
    {
        Task<List<Sale>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
        Task<Sale?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<List<Sale>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default);
        Task<List<Sale>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default);
        Task<Sale> CreateAsync(Sale sale, CancellationToken cancellationToken = default);
        Task<Sale> UpdateAsync(Sale sale, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsByReservationNumberAsync(string reservationNumber, int? excludeId = null, CancellationToken cancellationToken = default);
        Task<decimal> GetTotalPaidAsync(int saleId, CancellationToken cancellationToken = default);
        Task<decimal> GetRemainingBalanceAsync(int saleId, CancellationToken cancellationToken = default);
    }
}
