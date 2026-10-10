using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppSettings _settings;
        private readonly AppDbContext _context;

        // Hash fijo para igualar el costo de BCrypt cuando el usuario no existe.
        // Sin esto, la diferencia de tiempos permite enumerar usernames válidos.
        private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString());

        public AuthRepository(IOptions<AppSettings> settings, AppDbContext context)
        {
            _settings = settings.Value;
            _context = context;
        }

        public async Task<(User? user, string token, string refreshToken)> AuthLoginAsync(string username, string password, bool rememberMe, CancellationToken cancellationToken = default)
        {
            // Obtener el usuario de la base de datos
            var user = await GetUserByUserNameAsync(username, cancellationToken);

            if (user == null)
            {
                // Mismo costo que un intento real: no revelar si el usuario existe
                BCrypt.Net.BCrypt.Verify(password, DummyHash);
                return (null, string.Empty, string.Empty);
            }

            // Verificar la contraseña
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return (null, string.Empty, string.Empty);
            }

            // Usuarios desactivados (p. ej. subcuentas eliminadas) no pueden iniciar sesión
            if (!user.Active)
            {
                return (null, string.Empty, string.Empty);
            }

            // Limpiar sesiones ya vencidas del usuario (no aportan nada)
            var expiredSessions = await _context.RefreshTokens
                .Where(rt => rt.UserId == user.Id && rt.ExpiresAt < DateTime.UtcNow)
                .ToListAsync(cancellationToken);
            _context.RefreshTokens.RemoveRange(expiredSessions);

            // Crear una nueva sesión (una fila por dispositivo)
            var refreshToken = GenerateRefreshToken();
            var lifetime = GetRefreshTokenLifetime(rememberMe);
            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = HashToken(refreshToken),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(lifetime),
                IsRevoked = false
            });
            await _context.SaveChangesAsync(cancellationToken);

            var token = GenerateToken(user);
            return (user, token, refreshToken);
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim("fullName", $"{user.Name} {user.LastName}"),
                new Claim("userName", user.UserName),
                new Claim("email", user.Email),
                new Claim("userIcon", user.UserIconUrl ?? ""),
                new Claim(ClaimTypes.Name, user.UserName),  // Mantener para compatibilidad
                // Account isolation claims
                new Claim("accountId", user.AccountId.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim("role", user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_settings.ExperiesInMinutes);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<RefreshToken?> GetRefreshTokenWithUserAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            var tokenHash = HashToken(refreshToken);
            return await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);
        }

        public async Task<string> RotateRefreshTokenAsync(RefreshToken current, CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;

            // Conserva la ventana original de la sesión (7 días o 30 con "Recordarme")
            var window = current.ExpiresAt - current.CreatedAt;
            if (window <= TimeSpan.Zero)
                window = GetRefreshTokenLifetime(false);

            current.IsRevoked = true;

            var newRefreshToken = GenerateRefreshToken();
            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = current.UserId,
                TokenHash = HashToken(newRefreshToken),
                CreatedAt = now,
                ExpiresAt = now.Add(window),
                IsRevoked = false
            });

            await _context.SaveChangesAsync(cancellationToken);
            return newRefreshToken;
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return false;

            var tokenHash = HashToken(refreshToken);
            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

            if (stored == null || stored.IsRevoked)
                return false;

            stored.IsRevoked = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<int> PurgeExpiredTokensAsync(DateTime olderThan, CancellationToken cancellationToken = default)
        {
            var stale = await _context.RefreshTokens
                .Where(rt => rt.ExpiresAt < olderThan)
                .ToListAsync(cancellationToken);

            _context.RefreshTokens.RemoveRange(stale);
            await _context.SaveChangesAsync(cancellationToken);
            return stale.Count;
        }

        public TimeSpan GetRefreshTokenLifetime(bool rememberMe)
        {
            var minutes = rememberMe
                ? _settings.RememberMeRefreshTokenExpiresInMinutes
                : _settings.RefreshTokenExpiresInMinutes;

            return TimeSpan.FromMinutes(minutes);
        }

        public async Task<int> RevokeAllUserTokensAsync(int userId, CancellationToken cancellationToken = default)
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var token in activeTokens)
                token.IsRevoked = true;

            await _context.SaveChangesAsync(cancellationToken);
            return activeTokens.Count;
        }

        public async Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }

        public async Task<bool> UserExistsAsync(string userName, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AnyAsync(u => u.UserName == userName, cancellationToken);
        }

        public async Task<User?> GetUserByUserNameAsync(string userName, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == userName, cancellationToken);
        }

        private static string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        // El refresh token nunca se guarda en claro: solo su hash SHA-256
        private static string HashToken(string token)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }
    }
}
