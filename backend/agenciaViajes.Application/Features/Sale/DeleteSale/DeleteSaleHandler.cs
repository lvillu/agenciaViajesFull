using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.DeleteSale
{
    public class DeleteSaleHandler : IRequestHandler<DeleteSaleCommand, Result>
    {
        private readonly ISaleRepository _saleRepository;

        public DeleteSaleHandler(ISaleRepository saleRepository)
        {
            _saleRepository = saleRepository;
        }

        public async Task<Result> Handle(DeleteSaleCommand request, CancellationToken cancellationToken)
        {
            var deleted = await _saleRepository.DeleteAsync(request.Id, cancellationToken);

            if (!deleted)
            {
                return Result.Failure("Venta no encontrada");
            }

            return Result.Success();
        }
    }
}
