using agenciaViajes.Application.Domain.Entities;

namespace agenciaViajes.Application.Domain.Repositories
{
    public interface IAuthRepository
    {
        Task<(User? user, string token, string refreshToken)> AuthLoginAsync(string username, string password, bool rememberMe, CancellationToken cancellationToken = default);
        string GenerateToken(User user);

        // Refresh token (multi-dispositivo, almacenado hasheado)
        Task<RefreshToken?> GetRefreshTokenWithUserAsync(string refreshToken, CancellationToken cancellationToken = default);
        Task<string> RotateRefreshTokenAsync(RefreshToken current, CancellationToken cancellationToken = default);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
        TimeSpan GetRefreshTokenLifetime(bool rememberMe);

        // Métodos para Sign Up
        Task<bool> UserExistsAsync(string userName, CancellationToken cancellationToken = default);
        Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default);

        // Métodos para obtener usuario
        Task<User?> GetUserByUserNameAsync(string userName, CancellationToken cancellationToken = default);
    }
}
