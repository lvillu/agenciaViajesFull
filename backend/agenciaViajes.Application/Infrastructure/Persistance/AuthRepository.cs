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

        public string AuthLogin(string username, string password)
        {
            return GenerateToken(username, GenerateRefreshToken());
        }

        public bool AuthLogOut(string token)
        {
            return true;
        }

        public string GenerateToken(string username, string refreshToken)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("RefreshToken", refreshToken)  // Incluir el refresh token en el JWT
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddMinutes(_settings.ExperiesInMinutes);

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

        private string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        public DateTime GenerateRefreshTokenExpires()
        {
            return DateTime.Now.AddMinutes(_settings.RefreshTokenExpiresInMinutes);
        }
    }
}
