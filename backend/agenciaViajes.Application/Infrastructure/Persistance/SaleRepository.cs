using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class SaleRepository : ISaleRepository
    {
        private readonly AppDbContext _context;

        public SaleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Sale>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var query = _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(s => s.Active);
            }

            return await query
                .OrderByDescending(s => s.TravelDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Sale?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        }

        public async Task<List<Sale>> GetByClientIdAsync(int clientId, CancellationToken cancellationToken = default)
        {
            return await _context.Sales
                .Include(s => s.Provider)
                .Include(s => s.Payments)
                .Where(s => s.ClientId == clientId && s.Active)
                .OrderByDescending(s => s.TravelDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Sale>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default)
        {
            return await _context.Sales
                .Include(s => s.Client)
                .Include(s => s.Payments)
                .Where(s => s.ProviderId == providerId && s.Active)
                .OrderByDescending(s => s.TravelDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Sale> CreateAsync(Sale sale, CancellationToken cancellationToken = default)
        {
            sale.CreatedAt = DateTime.UtcNow;
            _context.Sales.Add(sale);
            await _context.SaveChangesAsync(cancellationToken);
            return sale;
        }

        public async Task<Sale> UpdateAsync(Sale sale, CancellationToken cancellationToken = default)
        {
            sale.ModifiedAt = DateTime.UtcNow;
            _context.Sales.Update(sale);
            await _context.SaveChangesAsync(cancellationToken);
            return sale;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var sale = await GetByIdAsync(id, cancellationToken);

            if (sale == null)
                return false;

            // Eliminación lógica
            sale.Active = false;
            sale.ModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<bool> ExistsByReservationNumberAsync(string reservationNumber, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            var query = _context.Sales.Where(s => s.ReservationNumber == reservationNumber);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task<decimal> GetTotalPaidAsync(int saleId, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.SaleId == saleId)
                .SumAsync(p => p.Amount, cancellationToken);
        }

        public async Task<decimal> GetRemainingBalanceAsync(int saleId, CancellationToken cancellationToken = default)
        {
            var sale = await _context.Sales
                .FirstOrDefaultAsync(s => s.Id == saleId, cancellationToken);

            if (sale == null)
                return 0;

            var totalPaid = await GetTotalPaidAsync(saleId, cancellationToken);
            return sale.TotalAmount - totalPaid;
        }
    }
}
