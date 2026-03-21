using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IClientRepository
    {
        Task<List<Client>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
        Task<Client?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default);
        Task<Client> UpdateAsync(Client client, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default);
    }
}
