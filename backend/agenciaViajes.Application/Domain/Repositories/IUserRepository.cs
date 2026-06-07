using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetSubAccountsByAccountIdAsync(Guid accountId, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
        Task<bool> UserNameExistsAsync(string userName, CancellationToken cancellationToken = default);
        Task UpdateAsync(User user, CancellationToken cancellationToken = default);
    }
}
