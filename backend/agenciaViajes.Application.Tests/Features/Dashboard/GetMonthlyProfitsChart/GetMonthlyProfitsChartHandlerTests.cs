using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Dashboard.GetMonthlyProfitsChart;
using FluentAssertions;
using NSubstitute;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Dashboard.GetMonthlyProfitsChart;

public class GetMonthlyProfitsChartHandlerTests
{
    private readonly IDashboardRepository _dashboardRepository = Substitute.For<IDashboardRepository>();
    private readonly GetMonthlyProfitsChartHandler _handler;

    public GetMonthlyProfitsChartHandlerTests()
    {
        _handler = new GetMonthlyProfitsChartHandler(_dashboardRepository);
    }

    [Fact]
    public async Task Handle_Always_Returns12MonthsWithProfitDataset()
    {
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetMonthlyProfitsChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Labels.Should().HaveCount(12);
        result.Data.Datasets.Should().HaveCount(1);
        result.Data.Datasets[0].Label.Should().Be("Ganancias (MXN)");
        result.Data.Datasets[0].Data.Should().HaveCount(12);
        result.Data.Datasets[0].Data.Should().OnlyContain(v => v == 0m);
    }

    [Fact]
    public async Task Handle_WhenSalesHaveProfit_CalculatesPercentageOverMxnAmount()
    {
        var sales = new List<SaleEntity>
        {
            new() { Id = 1, TotalAmount = 2000m, IsDollar = false, ProfitPercentage = 10m, CreatedAt = DateTime.UtcNow },
            new()
            {
                Id = 2,
                TotalAmount = 100m,
                IsDollar = true,
                ProfitPercentage = 10m,
                CreatedAt = DateTime.UtcNow,
                Payments = new List<agenciaViajes.Application.Domain.Entities.Payment>
                {
                    new() { ExchangeRate = 20m }
                }
            },
            new() { Id = 3, TotalAmount = 5000m, IsDollar = false, ProfitPercentage = null, CreatedAt = DateTime.UtcNow }
        };
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns(sales);

        var result = await _handler.Handle(new GetMonthlyProfitsChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        var expectedProfit = Math.Round((2000m * 10m / 100m) + ((100m * 20m) * 10m / 100m), 2);
        result.Data!.Datasets[0].Data[11].Should().Be(expectedProfit);
    }
}
