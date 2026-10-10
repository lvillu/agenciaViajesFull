using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;
        private readonly IAccountService _accountService;

        public ClientRepository(AppDbContext context, IAccountService accountService)
        {
            _context = context;
            _accountService = accountService;
        }

        // Tenant actual resuelto desde el JWT (claim accountId). Todas las lecturas
        // se filtran por cuenta: el cliente nunca envía ni ve el accountId.
        private Guid AccountId => _accountService.AccountId;

        public async Task<List<Client>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Clients.Where(c => c.AccountId == AccountId);

            if (!includeInactive)
            {
                query = query.Where(c => c.Active);
            }

            return await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<(List<Client> Items, int Total)> GetPagedAsync(int page, int pageSize, bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Clients.Where(c => c.AccountId == AccountId);

            if (!includeInactive)
            {
                query = query.Where(c => c.Active);
            }

            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        public async Task<Client?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == id && c.AccountId == AccountId, cancellationToken);
        }

        public async Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default)
        {
            _context.Clients.Add(client);
            await _context.SaveChangesAsync(cancellationToken);
            return client;
        }

        public async Task<Client> UpdateAsync(Client client, CancellationToken cancellationToken = default)
        {
            _context.Clients.Update(client);
            await _context.SaveChangesAsync(cancellationToken);
            return client;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var client = await GetByIdAsync(id, cancellationToken);
            
            if (client == null)
                return false;

            // Eliminación lógica
            client.Active = false;
            await _context.SaveChangesAsync(cancellationToken);
            
            return true;
        }

        public async Task<bool> ExistsByEmailAsync(string? email, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            var query = _context.Clients
                .Where(c => c.AccountId == AccountId && c.Email != null && c.Email.ToLower() == email.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }
    }
}
