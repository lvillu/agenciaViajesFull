using agenciaViajes.Application.Features.Sale.GetSalesList;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Sale.GetSalesList
{
    public class GetSalesListHandlerTests
    {
        private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
        private readonly GetSalesListHandler _handler;

        public GetSalesListHandlerTests()
        {
            _handler = new GetSalesListHandler(_saleRepository);
        }

        private static SaleEntity BuildSale(int id, decimal totalAmount, string reservationNumber, decimal paid = 0m) => new()
        {
            Id = id,
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = reservationNumber,
            Description = $"Venta {reservationNumber}",
            TotalAmount = totalAmount,
            IsDollar = false,
            ProfitPercentage = 10m,
            RequiredDeposit = totalAmount * 0.2m,
            FinalPaymentDueDate = new DateTime(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc),
            TravelDate = new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc),
            ReturnDate = new DateTime(2026, 9, 17, 12, 0, 0, DateTimeKind.Utc),
            Status = "Pendiente",
            Active = true,
            CreatedAt = new DateTime(2026, 5, 1, 12, 0, 0, DateTimeKind.Utc),
            Client = new ClientEntity
            {
                Id = 1,
                Name = "Juan",
                LastName = "Pérez",
                Phone = "+56912345678",
                Active = true
            },
            Provider = new ProviderEntity
            {
                Id = 2,
                Name = "AeroTravel",
                Acronym = "ATR",
                Email = "contacto@aerotravel.com",
                Phone = "+56987654321",
                ProviderContactName = "Ana Gómez",
                Active = true
            },
            SaleProviders =
            {
                new agenciaViajes.Application.Domain.Entities.SaleProvider
                {
                    Id = id,
                    SaleId = id,
                    ProviderId = 2,
                    ReservationNumber = reservationNumber,
                    Provider = new ProviderEntity { Id = 2, Name = "AeroTravel", Acronym = "ATR" }
                }
            },
            Payments = paid > 0
                ? new List<PaymentEntity> { new() { Id = id * 10, SaleId = id, Amount = paid } }
                : null
        };

        [Fact]
        public async Task Handle_WithNoSales_ReturnsEmptyPage()
        {
            _saleRepository
                .GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>())
                .Returns((new List<SaleEntity>(), 0));

            var result = await _handler.Handle(new GetSalesListQuery(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Data.Should().NotBeNull();
            result.Data!.Items.Should().BeEmpty();
            result.Data.Total.Should().Be(0);
            await _saleRepository.Received(1).GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithSales_ReturnsMappedPageWithTotalsFromIncludedPayments()
        {
            var sales = new List<SaleEntity>
            {
                BuildSale(1, 5000m, "RES-001", paid: 1000m),
                BuildSale(2, 8000m, "RES-002")
            };
            _saleRepository
                .GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>())
                .Returns((sales, 2));

            var result = await _handler.Handle(new GetSalesListQuery(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Items.Should().HaveCount(2);
            result.Data.Total.Should().Be(2);
            await _saleRepository.Received(1).GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>());

            // Sin N+1: los totales salen de los pagos incluidos, no de queries extra
            await _saleRepository.DidNotReceiveWithAnyArgs().GetTotalPaidAsync(default);

            var first = result.Data.Items[0];
            first.Id.Should().Be(1);
            first.ClientName.Should().Be("Juan Pérez");
            first.ProviderName.Should().Be("AeroTravel");
            first.ReservationNumber.Should().Be("RES-001");
            first.Description.Should().Be("Venta RES-001");
            first.TotalAmount.Should().Be(5000m);
            first.ProfitPercentage.Should().Be(10m);
            first.ProfitAmount.Should().Be(500m);
            first.RequiredDeposit.Should().Be(1000m);
            first.TravelDate.Should().Be(new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc));
            first.Status.Should().Be("Pendiente");
            first.Active.Should().BeTrue();
            first.TotalPaid.Should().Be(1000m);
            first.RemainingBalance.Should().Be(4000m);

            var second = result.Data.Items[1];
            second.Id.Should().Be(2);
            second.ClientName.Should().Be("Juan Pérez");
            second.ProviderName.Should().Be("AeroTravel");
            second.ReservationNumber.Should().Be("RES-002");
            second.TotalAmount.Should().Be(8000m);
            second.ProfitAmount.Should().Be(800m);
            second.TotalPaid.Should().Be(0m);
            second.RemainingBalance.Should().Be(8000m);
        }

        [Fact]
        public async Task Handle_WithIncludeInactive_PassesFlagToRepository()
        {
            _saleRepository
                .GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>())
                .Returns((new List<SaleEntity>(), 0));

            var result = await _handler.Handle(new GetSalesListQuery(true), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.Received(1).GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>());
        }
    }
}
