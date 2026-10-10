using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace agenciaViajes.Application.Infrastructure.Persistance
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly AppDbContext _context;
        private readonly IAccountService _accountService;

        public PaymentRepository(AppDbContext context, IAccountService accountService)
        {
            _context = context;
            _accountService = accountService;
        }

        // Tenant actual resuelto desde el JWT (claim accountId).
        private Guid AccountId => _accountService.AccountId;

        public async Task<List<Payment>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.AccountId == AccountId)
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Include(p => p.Sale)
                    .ThenInclude(s => s!.SaleProviders)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Payment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.AccountId == AccountId)
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Include(p => p.Sale)
                    .ThenInclude(s => s!.SaleProviders)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<List<Payment>> GetBySaleIdAsync(int saleId, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.AccountId == AccountId)
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Where(p => p.SaleId == saleId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync(cancellationToken);
        }

        public async Task<Payment> CreateAsync(Payment payment, CancellationToken cancellationToken = default)
        {
            payment.CreatedAt = DateTime.UtcNow;
            _context.Payments.Add(payment);

            // Reintento ante colisión de folio: dos requests concurrentes pueden
            // calcular el mismo MAX+1; el índice único (account_id, folio_number)
            // lo detecta y se recalcula en vez de devolver 500.
            // Nota: los handlers corren dentro de una transacción explícita
            // (TransactionBehaivor) donde un error aborta la transacción; por eso
            // el reintento usa SAVEPOINT para no arrastrar el aborto.
            // El presupuesto es amplio (20) porque con N contendientes se ganan
            // ~1 folio por ronda; cada ronda son 2 selects indexados + 1 insert.
            const int maxAttempts = 20;
            const string savepoint = "folio_retry";
            var transaction = _context.Database.CurrentTransaction;

            for (var attempt = 1; ; attempt++)
            {
                // Ensure FolioNumber is assigned using per-account sequence
                if (payment.FolioNumber == 0)
                {
                    var folioStart = await GetAccountFolioStartAsync(payment.AccountId, cancellationToken);
                    payment.FolioNumber = await GetNextFolioNumberAsync(payment.AccountId, folioStart, cancellationToken);
                }

                if (transaction is not null)
                {
                    await transaction.CreateSavepointAsync(savepoint, cancellationToken);
                }

                try
                {
                    await _context.SaveChangesAsync(cancellationToken);

                    if (transaction is not null)
                    {
                        await transaction.ReleaseSavepointAsync(savepoint, cancellationToken);
                    }

                    return payment;
                }
                catch (DbUpdateException ex) when (IsUniqueViolation(ex) && attempt < maxAttempts)
                {
                    if (transaction is not null)
                    {
                        await transaction.RollbackToSavepointAsync(savepoint, cancellationToken);
                    }

                    payment.FolioNumber = 0;
                }
            }
        }

        private static bool IsUniqueViolation(DbUpdateException ex)
        {
            return ex.InnerException is Npgsql.PostgresException pg
                && pg.SqlState == Npgsql.PostgresErrorCodes.UniqueViolation;
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

        public async Task<(List<Payment> Items, int Total)> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Payments
                .Where(p => p.AccountId == AccountId)
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Include(p => p.Sale)
                    .ThenInclude(s => s!.SaleProviders)
                .AsQueryable();

            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderByDescending(p => p.PaymentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        public async Task<(List<Payment> Items, int Total)> GetPagedBySaleIdAsync(int saleId, int page, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _context.Payments
                .Where(p => p.AccountId == AccountId)
                .Include(p => p.Sale)
                    .ThenInclude(s => s.Client)
                .Include(p => p.Sale)
                    .ThenInclude(s => s!.SaleProviders)
                .Where(p => p.SaleId == saleId)
                .AsQueryable();

            var total = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderByDescending(p => p.PaymentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, total);
        }

        public async Task<decimal> GetTotalBySaleIdAsync(int saleId, CancellationToken cancellationToken = default)
        {
            return await _context.Payments
                .Where(p => p.SaleId == saleId && p.AccountId == AccountId)
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
