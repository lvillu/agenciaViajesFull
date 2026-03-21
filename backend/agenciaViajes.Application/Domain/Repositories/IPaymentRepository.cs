using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IPaymentRepository
    {
        Task<List<Payment>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<Payment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<List<Payment>> GetBySaleIdAsync(int saleId, CancellationToken cancellationToken = default);
        Task<Payment> CreateAsync(Payment payment, CancellationToken cancellationToken = default);
        Task<Payment> UpdateAsync(Payment payment, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<decimal> GetTotalBySaleIdAsync(int saleId, CancellationToken cancellationToken = default);
    }
}
