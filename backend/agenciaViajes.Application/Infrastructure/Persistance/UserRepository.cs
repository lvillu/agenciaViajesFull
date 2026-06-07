using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetSubAccountsByAccountIdAsync(Guid accountId, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .Where(u => u.AccountId == accountId && u.Role == "subaccount")
                .OrderBy(u => u.UserName)
                .ToListAsync(cancellationToken);
        }

        public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        }

        public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }

        public async Task<bool> UserNameExistsAsync(string userName, CancellationToken cancellationToken = default)
        {
            return await _context.Users
                .AnyAsync(u => u.UserName == userName, cancellationToken);
        }

        public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
