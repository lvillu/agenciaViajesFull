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

            // Ensure FolioNumber is assigned using the sequence if not provided
            if (payment.FolioNumber == 0)
            {
                payment.FolioNumber = await GetNextFolioNumberAsync(cancellationToken);
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

        public async Task<int> GetNextFolioNumberAsync(CancellationToken cancellationToken = default)
        {
            // Use the DB sequence but guard against cases where the sequence
            // value is already present in the payments table (e.g. sequence
            // was behind after manual inserts). Retry until we obtain a
            // folio number that does not exist yet.
            while (true)
            {
                var nextFolio = await _context.Database
                    .SqlQueryRaw<long>("SELECT nextval('payments_folio_number_seq') AS \"Value\"")
                    .SingleAsync(cancellationToken);

                var exists = await _context.Payments
                    .AnyAsync(p => p.FolioNumber == (int)nextFolio, cancellationToken);

                if (!exists)
                    return (int)nextFolio;
                // Otherwise loop and get another sequence value
            }
        }
    }
}
