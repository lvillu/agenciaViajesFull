using agenciaViajes.Application.Domain.Repositories;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetDashboardCards
{
    public class GetDashboardCardsHandler : IRequestHandler<GetDashboardCardsQuery, Result<DashboardCardsResponse>>
    {
        private readonly IDashboardRepository _dashboardRepository;

        public GetDashboardCardsHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<Result<DashboardCardsResponse>> Handle(
            GetDashboardCardsQuery request,
            CancellationToken cancellationToken)
        {
            var estimatedProfit = await _dashboardRepository.GetEstimatedProfitCurrentMonthAsync(cancellationToken);
            var pendingSales = await _dashboardRepository.GetPendingSettlementSalesCurrentMonthAsync(cancellationToken);
            var nearCancellationSales = await _dashboardRepository.GetNearCancellationSalesAsync(5, cancellationToken);

            var response = new DashboardCardsResponse
            {
                EstimatedProfitCurrentMonth = estimatedProfit,
                PendingSettlementCount = pendingSales.Count,
                PendingSettlementSales = pendingSales.Select(s => MapToSaleItem(s)).ToList(),
                NearCancellationCount = nearCancellationSales.Count,
                NearCancellationSales = nearCancellationSales.Select(s => MapToSaleItem(s)).ToList()
            };

            return Result<DashboardCardsResponse>.Success(response);
        }

        private static DashboardSaleItem MapToSaleItem(SaleEntity sale)
        {
            var totalPaid = sale.Payments?.Sum(p => p.Amount) ?? 0;
            return new DashboardSaleItem
            {
                Id = sale.Id,
                ClientName = sale.Client != null ? $"{sale.Client.Name} {sale.Client.LastName}" : null,
                ProviderName = sale.Provider?.Name,
                ReservationNumber = sale.ReservationNumber,
                Description = sale.Description,
                TotalAmount = sale.TotalAmount,
                IsDollar = sale.IsDollar,
                TotalPaid = totalPaid,
                RemainingBalance = sale.TotalAmount - totalPaid,
                FinalPaymentDueDate = sale.FinalPaymentDueDate,
                TravelDate = sale.TravelDate
            };
        }
    }
}
