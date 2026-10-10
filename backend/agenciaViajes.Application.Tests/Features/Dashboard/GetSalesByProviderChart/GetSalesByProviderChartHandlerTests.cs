using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Dashboard.GetSalesByProviderChart;
using FluentAssertions;
using NSubstitute;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Dashboard.GetSalesByProviderChart;

public class GetSalesByProviderChartHandlerTests
{
    private readonly IDashboardRepository _dashboardRepository = Substitute.For<IDashboardRepository>();
    private readonly GetSalesByProviderChartHandler _handler;

    public GetSalesByProviderChartHandlerTests()
    {
        _handler = new GetSalesByProviderChartHandler(_dashboardRepository);
    }

    [Fact]
    public async Task Handle_WithoutSales_ReturnsEmptyChart()
    {
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetSalesByProviderChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Labels.Should().BeEmpty();
        result.Data.Datasets[0].Data.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenMultipleProviders_GroupsAndOrdersByTotalDesc()
    {
        var alpha = new agenciaViajes.Application.Domain.Entities.Provider { Name = "Alpha" };
        var beta = new agenciaViajes.Application.Domain.Entities.Provider { Name = "Beta" };

        var sales = new List<SaleEntity>
        {
            new() { Id = 1, TotalAmount = 1000m, Provider = alpha },
            new() { Id = 2, TotalAmount = 500m, Provider = alpha },
            new()
            {
                Id = 3,
                TotalAmount = 100m,
                IsDollar = true,
                Provider = beta,
                Payments = new List<agenciaViajes.Application.Domain.Entities.Payment> { new() { ExchangeRate = 10m } }
            },
            new() { Id = 4, TotalAmount = 50m, Provider = null }
        };
        _dashboardRepository.GetSalesLast12MonthsAsync(Arg.Any<CancellationToken>()).Returns(sales);

        var result = await _handler.Handle(new GetSalesByProviderChartQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Labels.Should().ContainInOrder("Alpha", "Beta", "Sin proveedor");
        result.Data.Datasets[0].Data[0].Should().Be(1500m);
        result.Data.Datasets[0].Data[1].Should().Be(1000m);
        result.Data.Datasets[0].Data[2].Should().Be(50m);
        result.Data.Datasets[0].Label.Should().Be("Ventas por proveedor (MXN)");
        result.Data.Datasets[0].BackgroundColor!.Should().HaveCount(3);
        result.Data.Datasets[0].BackgroundColor![0].Should().Be("#6366F1");
    }
}
