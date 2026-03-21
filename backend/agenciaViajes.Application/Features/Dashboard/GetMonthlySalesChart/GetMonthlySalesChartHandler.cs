using agenciaViajes.Application.Domain.Repositories;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Dashboard.Common.Responses;
using MediatR;
using System.Globalization;

namespace agenciaViajes.Application.Features.Dashboard.GetMonthlySalesChart
{
    public class GetMonthlySalesChartHandler : IRequestHandler<GetMonthlySalesChartQuery, Result<ChartDataResponse>>
    {
        private readonly IDashboardRepository _dashboardRepository;
        private static readonly CultureInfo _esMx = new("es-MX");

        // Colores para las 12 barras (degradado azul-índigo)
        private static readonly List<string> _barColors = Enumerable.Range(0, 12)
            .Select(_ => "rgba(99, 102, 241, 0.75)")
            .ToList();

        public GetMonthlySalesChartHandler(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<Result<ChartDataResponse>> Handle(
            GetMonthlySalesChartQuery request,
            CancellationToken cancellationToken)
        {
            var sales = await _dashboardRepository.GetSalesLast12MonthsAsync(cancellationToken);

            var today = DateTime.UtcNow;
            var months = BuildLast12Months(today);

            // Acumular ventas en MXN por mes
            var salesByMonth = new Dictionary<(int Year, int Month), decimal>();
            foreach (var (year, month) in months)
                salesByMonth[(year, month)] = 0;

            foreach (var sale in sales)
            {
                var key = (sale.CreatedAt.Year, sale.CreatedAt.Month);
                if (salesByMonth.ContainsKey(key))
                    salesByMonth[key] += GetAmountInMXN(sale);
            }

            var labels = months
                .Select(m => CapitalizeFirst(new DateTime(m.Year, m.Month, 1).ToString("MMM yyyy", _esMx)))
                .ToList();

            var data = months.Select(m => Math.Round(salesByMonth[m], 2)).ToList();

            var chartResponse = new ChartDataResponse
            {
                Labels = labels,
                Datasets = new List<ChartDataset>
                {
                    new ChartDataset
                    {
                        Label = "Ventas (MXN)",
                        Data = data,
                        BackgroundColor = _barColors,
                        BorderColor = _barColors,
                        BorderWidth = 1
                    }
                }
            };

            return Result<ChartDataResponse>.Success(chartResponse);
        }

        private static List<(int Year, int Month)> BuildLast12Months(DateTime today)
        {
            var months = new List<(int, int)>();
            for (int i = 11; i >= 0; i--)
            {
                var date = today.AddMonths(-i);
                months.Add((date.Year, date.Month));
            }
            return months;
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

        private static string CapitalizeFirst(string input) =>
            string.IsNullOrEmpty(input) ? input : char.ToUpper(input[0]) + input[1..];
    }
}
