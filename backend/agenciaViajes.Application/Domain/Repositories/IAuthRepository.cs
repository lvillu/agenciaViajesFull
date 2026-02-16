using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IAuthRepository
    {
        string AuthLogin(string username, string password);
        bool AuthLogOut(string token);
        string GenerateToken(string username, string refreshToken);

        // Métodos para Sign Up
        Task<bool> UserExistsAsync(string userName, CancellationToken cancellationToken = default);
        Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default);

        // Métodos para obtener usuario
        Task<User?> GetUserByUserNameAsync(string userName, CancellationToken cancellationToken = default);
    }
}
