using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSaleById
{
    public class GetSaleByIdHandler : IRequestHandler<GetSaleByIdQuery, Result<SaleResponse>>
    {
        private readonly ISaleRepository _saleRepository;

        public GetSaleByIdHandler(ISaleRepository saleRepository)
        {
            _saleRepository = saleRepository;
        }

        public async Task<Result<SaleResponse>> Handle(GetSaleByIdQuery request, CancellationToken cancellationToken)
        {
            var sale = await _saleRepository.GetByIdAsync(request.Id, cancellationToken);

            if (sale == null)
            {
                return Result<SaleResponse>.Failure("Venta no encontrada");
            }

            var totalPaid = await _saleRepository.GetTotalPaidAsync(sale.Id, cancellationToken);
            var remainingBalance = sale.TotalAmount - totalPaid;

            var response = new SaleResponse
            {
                Id = sale.Id,
                ClientId = sale.ClientId,
                ClientName = sale.Client != null ? $"{sale.Client.Name} {sale.Client.LastName}" : null,
                ProviderId = sale.ProviderId,
                ProviderName = sale.Provider?.Name,
                ReservationNumber = sale.ReservationNumber,
                Description = sale.Description,
                TotalAmount = sale.TotalAmount,
                IsDollar = sale.IsDollar,
                RequiredDeposit = sale.RequiredDeposit,
                FinalPaymentDueDate = sale.FinalPaymentDueDate,
                TravelDate = sale.TravelDate,
                ReturnDate = sale.ReturnDate,
                Status = sale.Status,
                Active = sale.Active,
                TotalPaid = totalPaid,
                RemainingBalance = remainingBalance,
                CreatedAt = sale.CreatedAt,
                ModifiedAt = sale.ModifiedAt
            };

            return Result<SaleResponse>.Success(response);
        }
    }
}
