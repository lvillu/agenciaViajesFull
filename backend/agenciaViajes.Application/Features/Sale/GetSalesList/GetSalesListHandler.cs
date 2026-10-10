using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSalesList
{
    public class GetSalesListHandler : IRequestHandler<GetSalesListQuery, Result<PagedResponse<SaleResponse>>>
    {
        private readonly ISaleRepository _saleRepository;

        public GetSalesListHandler(ISaleRepository saleRepository)
        {
            _saleRepository = saleRepository;
        }

        public async Task<Result<PagedResponse<SaleResponse>>> Handle(GetSalesListQuery request, CancellationToken cancellationToken)
        {
            var (page, pageSize) = Paging.Normalize(request.Page, request.PageSize);
            var (items, total) = await _saleRepository.GetPagedAsync(page, pageSize, request.IncludeInactive, cancellationToken);

            var responses = items.Select(sale =>
            {
                // TotalPaid desde los pagos ya incluidos (sin query adicional N+1)
                var totalPaid = sale.Payments?.Sum(p => p.Amount) ?? 0m;
                var remainingBalance = sale.TotalAmount - totalPaid;

                return new SaleResponse
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
                    ProfitAmount = sale.ProfitPercentage.HasValue ? Math.Round(sale.CommissionBase * sale.ProfitPercentage.Value / 100, 2) : null,
                    CommissionableAmount = sale.CommissionableAmount,
                    NonCommissionableAmount = sale.NonCommissionableAmount,
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
                };
            }).ToList();

            return Result<PagedResponse<SaleResponse>>.Success(new PagedResponse<SaleResponse>
            {
                Items = responses,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }
    }
}
