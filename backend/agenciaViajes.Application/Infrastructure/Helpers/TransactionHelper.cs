using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore.Storage;

namespace agenciaViajes.Application.Infrastructure.Helpers
{
    public class TransactionHelper
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction? _transaction;

        public TransactionHelper(AppDbContext context)
        {
            _context = context;
            _transaction = null;
        }

        public void BegingTransaction()
        {
            _transaction = _context.Database.BeginTransaction();
        }

        public void CommitTransaction()
        {
            _transaction?.Commit();
        }

        public void RollbackTransaction()
        {
            _transaction?.Rollback();
        }

        public void Dispose()
        {
            _transaction?.Dispose();
        }
    }
}
