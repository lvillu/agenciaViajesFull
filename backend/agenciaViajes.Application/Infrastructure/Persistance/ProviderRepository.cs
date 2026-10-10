using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class ProviderRepository : IProviderRepository
    {
        private readonly AppDbContext _context;
        private readonly IAccountService _accountService;

        public ProviderRepository(AppDbContext context, IAccountService accountService)
        {
            _context = context;
            _accountService = accountService;
        }

        // Tenant actual resuelto desde el JWT (claim accountId).
        private Guid AccountId => _accountService.AccountId;

        public async Task<List<Provider>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Providers.Where(p => p.AccountId == AccountId);

            if (!includeInactive)
            {
                query = query.Where(p => p.Active);
            }

            return await query
                .OrderBy(p => p.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Provider?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Providers
                .FirstOrDefaultAsync(p => p.Id == id && p.AccountId == AccountId, cancellationToken);
        }

        public async Task<Provider> CreateAsync(Provider provider, CancellationToken cancellationToken = default)
        {
            _context.Providers.Add(provider);
            await _context.SaveChangesAsync(cancellationToken);
            return provider;
        }

        public async Task<Provider> UpdateAsync(Provider provider, CancellationToken cancellationToken = default)
        {
            _context.Providers.Update(provider);
            await _context.SaveChangesAsync(cancellationToken);
            return provider;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var provider = await GetByIdAsync(id, cancellationToken);
            
            if (provider == null)
                return false;

            // Eliminación lógica
            provider.Active = false;
            await _context.SaveChangesAsync(cancellationToken);
            
            return true;
        }

        public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Providers
                .Where(p => p.AccountId == AccountId && p.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }
    }
}
