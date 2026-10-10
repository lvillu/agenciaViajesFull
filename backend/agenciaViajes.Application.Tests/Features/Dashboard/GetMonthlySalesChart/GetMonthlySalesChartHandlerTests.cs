using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Dashboard.GetMonthlySalesChart;
using FluentAssertions;
using NSubstitute;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Dashboard.GetMonthlySalesChart;

public class GetMonthlySalesChartHandlerTests
{
    private readonly IDashboardRepository _dashboardRepository = Substitute.For<IDashboardRepository>();
    private readonly GetMonthlySalesChartHandler _handler;

    public GetMonthlySalesChartHandlerTests()
    {
        _handler = new GetMonthlySalesChartHandler(_dashboardRepository);
    }

    [Fact]
    public async Task Handle_Always_Returns12MonthsWithLabelsAndDataset()
    {
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetMonthlySalesChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Labels.Should().HaveCount(12);
        result.Data.Datasets.Should().HaveCount(1);
        result.Data.Datasets[0].Label.Should().Be("Ventas (MXN)");
        result.Data.Datasets[0].Data.Should().HaveCount(12);
        result.Data.Datasets[0].BackgroundColor.Should().HaveCount(12);
    }

    [Fact]
    public async Task Handle_WhenSalesInCurrentMonth_AccumulatesMxnAndConvertedUsd()
    {
        var sales = new List<SaleEntity>
        {
            new() { Id = 1, TotalAmount = 1000m, IsDollar = false, CreatedAt = DateTime.UtcNow },
            new()
            {
                Id = 2,
                TotalAmount = 100m,
                IsDollar = true,
                CreatedAt = DateTime.UtcNow,
                Payments = new List<agenciaViajes.Application.Domain.Entities.Payment>
                {
                    new() { ExchangeRate = 20m },
                    new() { ExchangeRate = 22m }
                }
            },
            new() { Id = 3, TotalAmount = 9999m, IsDollar = false, CreatedAt = DateTime.UtcNow.AddMonths(-13) }
        };
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns(sales);

        var result = await _handler.Handle(new GetMonthlySalesChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        var currentMonthValue = 1000m + (100m * ((20m + 22m) / 2m));
        result.Data!.Datasets[0].Data[11].Should().Be(currentMonthValue);
        result.Data.Datasets[0].Data.Take(11).Should().OnlyContain(v => v == 0m);
    }
}
