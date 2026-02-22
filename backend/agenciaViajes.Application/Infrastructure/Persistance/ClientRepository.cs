using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Client>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Clients.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(c => c.Active);
            }

            return await query
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Client?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
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

        public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Clients.Where(c => c.Email.ToLower() == email.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }
    }
}
