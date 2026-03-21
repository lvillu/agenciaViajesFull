using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class ProviderRepository : IProviderRepository
    {
        private readonly AppDbContext _context;

        public ProviderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Provider>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Providers.AsQueryable();

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
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
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
            var query = _context.Providers.Where(p => p.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }
    }
}
