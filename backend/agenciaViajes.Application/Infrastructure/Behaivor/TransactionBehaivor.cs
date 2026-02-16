using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Infrastructure.Context;
using agenciaViajes.Application.Infrastructure.Helpers;
using MediatR;

namespace agenciaViajes.Application.Infrastructure.Behaivor
{
    public class TransactionBehaivor<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
    {
        public readonly AppDbContext _context;
        public readonly TransactionHelper _transactionHelper;

        public TransactionBehaivor(AppDbContext context, TransactionHelper transactionHelper)
        {
            _context = context;
            _transactionHelper = transactionHelper;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            // Las transacciones solo se aplicaran cuando el request lo especifique
            if (request is not ITransactionalCommand)
            {
                return await next();
            }

            _transactionHelper.BegingTransaction();

            try
            {
                var response = await next();

                _transactionHelper.CommitTransaction();

                return response;
            }
            catch (Exception)
            {
                _transactionHelper?.RollbackTransaction();
                throw;
            }
        }
    }
}
