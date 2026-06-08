using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;

        public PaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Payment>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Payment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<List<Payment>> GetBySaleIdAsync(int saleId, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Where(p => p.SaleId == saleId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Payment> CreateAsync(Payment payment, CancellationToken cancellationToken = default)
        {
            payment.CreatedAt = DateTime.UtcNow;

            // Ensure FolioNumber is assigned using per-account sequence
            if (payment.FolioNumber == 0)
            {
                var folioStart = await GetAccountFolioStartAsync(payment.AccountId, cancellationToken);
                payment.FolioNumber = await GetNextFolioNumberAsync(payment.AccountId, folioStart, cancellationToken);
            }

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync(cancellationToken);
            return payment;
        }

        public async Task<Payment> UpdateAsync(Payment payment, CancellationToken cancellationToken = default)
        {
            payment.ModifiedAt = DateTime.UtcNow;
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync(cancellationToken);
            return payment;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var payment = await GetByIdAsync(id, cancellationToken);

            if (payment == null)
                return false;

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<decimal> GetTotalBySaleIdAsync(int saleId, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.SaleId == saleId)
                .SumAsync(p => p.Amount, cancellationToken);
        }

        public async Task<int> GetNextFolioNumberAsync(Guid accountId, int folioStart, CancellationToken cancellationToken = default)
        {
            // Per-account folio: MAX(folio_number) + 1 for the given account.
            // The composite unique index (account_id, folio_number) prevents duplicates.
            // In the rare case of a concurrent collision, the caller retries.
            while (true)
            {
                var maxFolio = await _context.Payments
                    .Where(p => p.AccountId == accountId)
                    .MaxAsync(p => (int?)p.FolioNumber, cancellationToken) ?? (folioStart - 1);

                var nextFolio = maxFolio + 1;

                // Guard: ensure we never go below folioStart
                if (nextFolio < folioStart)
                    nextFolio = folioStart;

                var exists = await _context.Payments
                    .AnyAsync(p => p.AccountId == accountId && p.FolioNumber == nextFolio, cancellationToken);

                if (!exists)
                    return nextFolio;

                // Collision — another transaction just inserted this folio; loop and retry
            }
        }

        public async Task<int> GetAccountFolioStartAsync(Guid accountId, CancellationToken cancellationToken = default)
        {
            // Get the folio start from the owner user of this account
            var owner = await _context.Users
                .Where(u => u.AccountId == accountId && u.Role == "owner")
                .Select(u => (int?)u.FolioStart)
                .FirstOrDefaultAsync(cancellationToken);

            return owner ?? 1; // default to 1 if not found
        }
    }
}
