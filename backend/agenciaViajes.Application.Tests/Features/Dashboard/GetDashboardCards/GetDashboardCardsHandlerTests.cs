using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Dashboard.GetDashboardCards;
using FluentAssertions;
using NSubstitute;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Dashboard.GetDashboardCards;

public class GetDashboardCardsHandlerTests
{
    private readonly IDashboardRepository _dashboardRepository = Substitute.For<IDashboardRepository>();
    private readonly GetDashboardCardsHandler _handler;

    public GetDashboardCardsHandlerTests()
    {
        _handler = new GetDashboardCardsHandler(_dashboardRepository);
    }

    [Fact]
    public async Task Handle_WhenDataExists_ReturnsCardsWithCountsAndMappedSales()
    {
        _dashboardRepository.GetEstimatedProfitCurrentMonthAsync(Arg.Any<CancellationToken>()).Returns(1500m);

        var pending = new List<SaleEntity>
        {
            new()
            {
                Id = 1,
                ReservationNumber = "RES-001",
                Description = "Paquete Cancún",
                TotalAmount = 10000m,
                TravelDate = new DateTime(2026, 9, 1),
                FinalPaymentDueDate = new DateTime(2026, 8, 20),
                Client = new agenciaViajes.Application.Domain.Entities.Client { Name = "Ana", LastName = "Ruiz" },
                Provider = new agenciaViajes.Application.Domain.Entities.Provider { Name = "Hotelero X" },
                Payments = new List<agenciaViajes.Application.Domain.Entities.Payment>
                {
                    new() { Amount = 3000m },
                    new() { Amount = 2000m }
                }
            },
            new()
            {
                Id = 2,
                ReservationNumber = "RES-002",
                TotalAmount = 4000m,
                TravelDate = new DateTime(2026, 10, 5)
            }
        };
        var nearCancellation = new List<SaleEntity>
        {
            new()
            {
                Id = 3,
                ReservationNumber = "RES-003",
                TotalAmount = 7000m,
                TravelDate = new DateTime(2026, 8, 30),
                Client = new agenciaViajes.Application.Domain.Entities.Client { Name = "Luis", LastName = "Mora" },
                Payments = new List<agenciaViajes.Application.Domain.Entities.Payment>
                {
                    new() { Amount = 7000m }
                }
            }
        };

        _dashboardRepository.GetPendingSettlementSalesCurrentMonthAsync(Arg.Any<CancellationToken>()).Returns(pending);
        _dashboardRepository.GetNearCancellationSalesAsync(5, Arg.Any<CancellationToken>()).Returns(nearCancellation);

        var result = await _handler.Handle(new GetDashboardCardsQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.EstimatedProfitCurrentMonth.Should().Be(1500m);

        result.Data.PendingSettlementCount.Should().Be(2);
        result.Data.PendingSettlementSales[0].Id.Should().Be(1);
        result.Data.PendingSettlementSales[0].ClientName.Should().Be("Ana Ruiz");
        result.Data.PendingSettlementSales[0].ProviderName.Should().Be("Hotelero X");
        result.Data.PendingSettlementSales[0].TotalPaid.Should().Be(5000m);
        result.Data.PendingSettlementSales[0].RemainingBalance.Should().Be(5000m);
        result.Data.PendingSettlementSales[1].TotalPaid.Should().Be(0m);
        result.Data.PendingSettlementSales[1].RemainingBalance.Should().Be(4000m);

        result.Data.NearCancellationCount.Should().Be(1);
        result.Data.NearCancellationSales[0].Id.Should().Be(3);
        result.Data.NearCancellationSales[0].ClientName.Should().Be("Luis Mora");
        result.Data.NearCancellationSales[0].RemainingBalance.Should().Be(0m);
    }

    [Fact]
    public async Task Handle_WhenNoData_ReturnsEmptyCards()
    {
        _dashboardRepository.GetEstimatedProfitCurrentMonthAsync(Arg.Any<CancellationToken>()).Returns(0m);
        _dashboardRepository.GetPendingSettlementSalesCurrentMonthAsync(Arg.Any<CancellationToken>()).Returns([]);
        _dashboardRepository.GetNearCancellationSalesAsync(5, Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetDashboardCardsQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.EstimatedProfitCurrentMonth.Should().Be(0m);
        result.Data.PendingSettlementCount.Should().Be(0);
        result.Data.NearCancellationCount.Should().Be(0);
    }
}
