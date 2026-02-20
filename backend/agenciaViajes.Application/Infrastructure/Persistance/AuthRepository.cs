using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppSettings _settings;
        private readonly AppDbContext _context;

        public AuthRepository(IOptions<AppSettings> settings, AppDbContext context)
        {
            _settings = settings.Value;
            _context = context;
        }

        public async Task<(User? user, string token)> AuthLoginAsync(string username, string password, CancellationToken cancellationToken = default)
        {
            // Obtener el usuario de la base de datos
            var user = await GetUserByUserNameAsync(username, cancellationToken);
            
            if (user == null)
            {
                return (null, string.Empty);
            }

            // Verificar la contraseña
            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return (null, string.Empty);
            }

            // Generar refresh token y guardarlo
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = GenerateRefreshTokenExpires();
            await _context.SaveChangesAsync(cancellationToken);

            var token = GenerateToken(user, refreshToken);
            return (user, token);
        }

        public bool AuthLogOut(string token)
        {
            return true;
        }

        public string GenerateToken(User user, string refreshToken)
        {
            var claims = new[]
            {
                new Claim("fullName", $"{user.Name} {user.LastName}"),
                new Claim("userName", user.UserName),
                new Claim("email", user.Email),
                new Claim("userIcon", user.UserIconUrl ?? ""),
                new Claim(ClaimTypes.Name, user.UserName),  // Mantener para compatibilidad
                new Claim("RefreshToken", refreshToken)
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

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, cancellationToken);
        }

        private string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        public DateTime GenerateRefreshTokenExpires()
        {
            return DateTime.UtcNow.AddMinutes(_settings.RefreshTokenExpiresInMinutes);
        }
    }
}
