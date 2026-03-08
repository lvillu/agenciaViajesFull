using agenciaViajes.Application.Domain.Repositories;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Dashboard.GetSalesByProviderChart
{
    public class GetSalesByProviderChartHandler : IRequestHandler<GetSalesByProviderChartQuery, Result<ChartDataResponse>>
    {
        private readonly IDashboardRepository _dashboardRepository;

        // Paleta de colores para la dona (PrimeReact / Chart.js)
        private static readonly List<string> _donutColors = new()
        {
            "#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6",
            "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#64748B",
            "#06B6D4", "#84CC16"
        };

        public GetSalesByProviderChartHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<Result<ChartDataResponse>> Handle(
            GetSalesByProviderChartQuery request,
            CancellationToken cancellationToken)
        {
            var sales = await _dashboardRepository.GetSalesLast12MonthsAsync(cancellationToken);

            // Agrupar por proveedor sumando montos en MXN
            var byProvider = sales
                .GroupBy(s => s.Provider?.Name ?? "Sin proveedor")
                .Select(g => new
                {
                    ProviderName = g.Key,
                    TotalMXN = g.Sum(s => GetAmountInMXN(s))
                })
                .OrderByDescending(x => x.TotalMXN)
                .ToList();

            var labels = byProvider.Select(x => x.ProviderName).ToList();
            var data = byProvider.Select(x => Math.Round(x.TotalMXN, 2)).ToList();
            var colors = byProvider
                .Select((_, i) => _donutColors[i % _donutColors.Count])
                .ToList();

            var chartResponse = new ChartDataResponse
            {
                Labels = labels,
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Ventas por proveedor (MXN)",
                        Data = data,
                        BackgroundColor = colors,
                        BorderColor = colors,
                        BorderWidth = 1
                    }
                }
            };

            return Result<ChartDataResponse>.Success(chartResponse);
        }

        private static decimal GetAmountInMXN(SaleEntity sale)
        {
            if (!sale.IsDollar) return sale.TotalAmount;

            var rates = sale.Payments?
                .Where(p => p.ExchangeRate.HasValue && p.ExchangeRate > 0)
                .Select(p => p.ExchangeRate!.Value)
                .ToList();

            if (rates == null || rates.Count == 0) return sale.TotalAmount;

            return sale.TotalAmount * rates.Average();
        }
    }
}
