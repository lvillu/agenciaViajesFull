using agenciaViajes.Application.Features.Sale.GetSaleById;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Sale.GetSaleById
{
    public class GetSaleByIdHandlerTests
    {
        private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
        private readonly GetSaleByIdHandler _handler;

        public GetSaleByIdHandlerTests()
        {
            _handler = new GetSaleByIdHandler(_saleRepository);
        }

        private static SaleEntity BuildSale() => new()
        {
            Id = 33,
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = "RES-33",
            Description = "Tour Europeo",
            TotalAmount = 20000m,
            IsDollar = true,
            ProfitPercentage = 8m,
            RequiredDeposit = 5000m,
            FinalPaymentDueDate = new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc),
            TravelDate = new DateTime(2026, 10, 10, 12, 0, 0, DateTimeKind.Utc),
            ReturnDate = new DateTime(2026, 10, 25, 12, 0, 0, DateTimeKind.Utc),
            Status = "Confirmada",
            Active = true,
            CreatedAt = new DateTime(2026, 2, 1, 12, 0, 0, DateTimeKind.Utc),
            ModifiedAt = new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc),
            Client = new ClientEntity
            {
                Id = 1,
                Name = "María",
                LastName = "López",
                Phone = "+56955555555",
                Active = true
            },
            Provider = new ProviderEntity
            {
                Id = 2,
                Name = "EuroPass",
                Acronym = "EUP",
                Email = "info@europass.com",
                Phone = "+56944444444",
                ProviderContactName = "Luis Ruiz",
                Active = true
            }
        };

        [Fact]
        public async Task Handle_WithNonExistentSale_ReturnsFailureWithoutQueryingTotals()
        {
            _saleRepository
                .GetByIdAsync(99, Arg.Any<CancellationToken>())
                .Returns((SaleEntity?)null);

            var result = await _handler.Handle(new GetSaleByIdQuery(99), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Venta no encontrada");
            result.Data.Should().BeNull();
            await _saleRepository.Received(1).GetByIdAsync(99, Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().GetTotalPaidAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithExistingSale_MapsResponseIncludingTotalsAndProfit()
        {
            var sale = BuildSale();
            _saleRepository
                .GetByIdAsync(33, Arg.Any<CancellationToken>())
                .Returns(sale);
            _saleRepository
                .GetTotalPaidAsync(33, Arg.Any<CancellationToken>())
                .Returns(7500m);

            var result = await _handler.Handle(new GetSaleByIdQuery(33), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(33);
            result.Data.ClientId.Should().Be(1);
            result.Data.ClientName.Should().Be("María López");
            result.Data.ProviderId.Should().Be(2);
            result.Data.ProviderName.Should().Be("EuroPass");
            result.Data.ReservationNumber.Should().Be("RES-33");
            result.Data.Description.Should().Be("Tour Europeo");
            result.Data.TotalAmount.Should().Be(20000m);
            result.Data.IsDollar.Should().BeTrue();
            result.Data.ProfitPercentage.Should().Be(8m);
            result.Data.ProfitAmount.Should().Be(1600m);
            result.Data.RequiredDeposit.Should().Be(5000m);
            result.Data.FinalPaymentDueDate.Should().Be(new DateTime(2026, 10, 1, 12, 0, 0, DateTimeKind.Utc));
            result.Data.TravelDate.Should().Be(new DateTime(2026, 10, 10, 12, 0, 0, DateTimeKind.Utc));
            result.Data.ReturnDate.Should().Be(new DateTime(2026, 10, 25, 12, 0, 0, DateTimeKind.Utc));
            result.Data.Status.Should().Be("Confirmada");
            result.Data.Active.Should().BeTrue();
            result.Data.TotalPaid.Should().Be(7500m);
            result.Data.RemainingBalance.Should().Be(12500m);
            result.Data.CreatedAt.Should().Be(new DateTime(2026, 2, 1, 12, 0, 0, DateTimeKind.Utc));
            result.Data.ModifiedAt.Should().Be(new DateTime(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc));
        }

        [Fact]
        public async Task Handle_WithSaleWithoutNavigationProperties_ClientAndProviderNamesAreNull()
        {
            var sale = BuildSale();
            sale.Client = null;
            sale.Provider = null;
            _saleRepository
                .GetByIdAsync(33, Arg.Any<CancellationToken>())
                .Returns(sale);
            _saleRepository
                .GetTotalPaidAsync(33, Arg.Any<CancellationToken>())
                .Returns(0m);

            var result = await _handler.Handle(new GetSaleByIdQuery(33), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.ClientName.Should().BeNull();
            result.Data.ProviderName.Should().BeNull();
        }
    }
}
