using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IProviderRepository
    {
        Task<List<Provider>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
        Task<Provider?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Provider> CreateAsync(Provider provider, CancellationToken cancellationToken = default);
        Task<Provider> UpdateAsync(Provider provider, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    }
}
