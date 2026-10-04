using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSalesList
{
    public class GetSalesListHandler : IRequestHandler<GetSalesListQuery, Result<List<SaleResponse>>>
    {
        private readonly ISaleRepository _saleRepository;

        public GetSalesListHandler(ISaleRepository saleRepository)
        {
            _saleRepository = saleRepository;
        }

        public async Task<Result<List<SaleResponse>>> Handle(GetSalesListQuery request, CancellationToken cancellationToken)
        {
            var sales = await _saleRepository.GetAllAsync(request.IncludeInactive, cancellationToken);

            var responses = new List<SaleResponse>();

            foreach (var sale in sales)
            {
                var totalPaid = await _saleRepository.GetTotalPaidAsync(sale.Id, cancellationToken);
                var remainingBalance = sale.TotalAmount - totalPaid;

                responses.Add(new SaleResponse
                {
                    Id = sale.Id,
                    ClientId = sale.ClientId,
                    ClientName = sale.Client != null ? $"{sale.Client.Name} {sale.Client.LastName}" : null,
                    ProviderId = sale.SaleProviders.FirstOrDefault()?.ProviderId,
                    ProviderName = sale.SaleProviders.FirstOrDefault()?.Provider?.Name,
                    ReservationNumber = sale.SaleProviders.FirstOrDefault()?.ReservationNumber,
                    Description = sale.Description,
                    TotalAmount = sale.TotalAmount,
                    IsDollar = sale.IsDollar,
                    ProfitPercentage = sale.ProfitPercentage,
                    ProfitAmount = sale.ProfitPercentage.HasValue ? Math.Round(sale.TotalAmount * sale.ProfitPercentage.Value / 100, 2) : null,
                    RequiredDeposit = sale.RequiredDeposit,
                    FinalPaymentDueDate = sale.FinalPaymentDueDate,
                    TravelDate = sale.TravelDate,
                    ReturnDate = sale.ReturnDate,
                    Status = sale.Status,
                    Active = sale.Active,
                    TotalPaid = totalPaid,
                    RemainingBalance = remainingBalance,
                    CreatedAt = sale.CreatedAt,
                    ModifiedAt = sale.ModifiedAt,
                    Providers = sale.SaleProviders.Select(sp => new SaleProviderDto
                    {
                        Id = sp.Id,
                        ProviderId = sp.ProviderId,
                        ProviderName = sp.Provider?.Name,
                        ProviderAcronym = sp.Provider?.Acronym,
                        ReservationNumber = sp.ReservationNumber
                    }).ToList()
                });
            }

            return Result<List<SaleResponse>>.Success(responses);
        }
    }
}
