using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IAuthRepository
    {
        Task<(User? user, string token)> AuthLoginAsync(string username, string password, CancellationToken cancellationToken = default);
        bool AuthLogOut(string token);
        string GenerateToken(User user, string refreshToken);

        // Métodos para Sign Up
        Task<bool> UserExistsAsync(string userName, CancellationToken cancellationToken = default);
        Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default);

        // Métodos para obtener usuario
        Task<User?> GetUserByUserNameAsync(string userName, CancellationToken cancellationToken = default);
        Task<User?> GetUserByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

        DateTime GenerateRefreshTokenExpires();
    }
}
