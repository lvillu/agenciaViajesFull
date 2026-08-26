using agenciaViajes.Application.Features.Sale.CreateSale;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Requests;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Sale.CreateSale
{
    public class CreateSaleHandlerTests
    {
        private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
        private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
        private readonly CreateSaleHandler _handler;

        public CreateSaleHandlerTests()
        {
            _handler = new CreateSaleHandler(_saleRepository, _clientRepository, _providerRepository, _paymentRepository);
        }

        private static ClientEntity BuildClient(int id = 1) => new()
        {
            Id = id,
            Name = "Juan",
            LastName = "Pérez",
            Phone = "+56912345678",
            Active = true
        };

        private static ProviderEntity BuildProvider(int id = 2) => new()
        {
            Id = id,
            Name = "AeroTravel",
            Acronym = "ATR",
            Email = "contacto@aerotravel.com",
            Phone = "+56987654321",
            ProviderContactName = "Ana Gómez",
            Active = true
        };

        private static CreateSaleRequest BuildValidRequest(
            decimal? requiredDeposit = null,
            string? reservationNumber = "RES-2026-001",
            string? status = null) => new()
        {
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = reservationNumber,
            Description = "Paquete Cancún todo incluido",
            TotalAmount = 10000m,
            IsDollar = false,
            ProfitPercentage = 12.5m,
            RequiredDeposit = requiredDeposit,
            FinalPaymentDueDate = new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc),
            TravelDate = new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc),
            ReturnDate = new DateTime(2026, 9, 22, 12, 0, 0, DateTimeKind.Utc),
            Status = status
        };

        private void SetupSuccessfulCreation(CreateSaleRequest request)
        {
            _clientRepository
                .GetByIdAsync(request.ClientId, Arg.Any<CancellationToken>())
                .Returns(BuildClient());
            _providerRepository
                .GetByIdAsync(request.ProviderId, Arg.Any<CancellationToken>())
                .Returns(BuildProvider());
            _saleRepository
                .ExistsByReservationNumberAsync(Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(false);
            _saleRepository
                .CreateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>())
                .Returns(c =>
                {
                    var sale = c.ArgAt<SaleEntity>(0);
                    sale.Id = 77;
                    return sale;
                });
        }

        [Fact]
        public async Task Handle_WithNonExistentClient_ReturnsFailureWithoutCreatingSale()
        {
            var request = BuildValidRequest();
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns((ClientEntity?)null);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("El cliente especificado no existe");
            result.Data.Should().BeNull();
            await _clientRepository.Received(1).GetByIdAsync(1, Arg.Any<CancellationToken>());
            await _providerRepository.DidNotReceive().GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().CreateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithNonExistentProvider_ReturnsFailureWithoutCreatingSale()
        {
            var request = BuildValidRequest();
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns(BuildClient());
            _providerRepository
                .GetByIdAsync(2, Arg.Any<CancellationToken>())
                .Returns((ProviderEntity?)null);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("El proveedor especificado no existe");
            result.Data.Should().BeNull();
            await _saleRepository.DidNotReceive().ExistsByReservationNumberAsync(Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().CreateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
            await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithDuplicateReservationNumber_ReturnsFailureWithoutCreatingSale()
        {
            var request = BuildValidRequest();
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns(BuildClient());
            _providerRepository
                .GetByIdAsync(2, Arg.Any<CancellationToken>())
                .Returns(BuildProvider());
            _saleRepository
                .ExistsByReservationNumberAsync("RES-2026-001", Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(true);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Ya existe una venta con ese número de reserva");
            result.Data.Should().BeNull();
            await _saleRepository.Received(1).ExistsByReservationNumberAsync("RES-2026-001", Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().CreateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
            await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public async Task Handle_WithNullOrWhitespaceReservationNumber_SkipsDuplicateCheck(string? reservationNumber)
        {
            var request = BuildValidRequest(reservationNumber: reservationNumber);
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.DidNotReceive().ExistsByReservationNumberAsync(Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _saleRepository.Received(1).CreateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithPositiveRequiredDeposit_RegistersInitialPaymentAutomatically()
        {
            var request = BuildValidRequest(requiredDeposit: 5000m);
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Be("Venta creada exitosamente");
            result.Data.Should().NotBeNull();
            result.Data!.TotalPaid.Should().Be(5000m);
            result.Data.RemainingBalance.Should().Be(5000m);
            await _paymentRepository.Received(1).CreateAsync(
                Arg.Is<PaymentEntity>(p =>
                    p.SaleId == 77 &&
                    p.Amount == 5000m &&
                    p.Notes == "Anticipo inicial registrado automáticamente al crear la venta" &&
                    p.PaymentDate != default),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithZeroRequiredDeposit_DoesNotRegisterInitialPayment()
        {
            var request = BuildValidRequest(requiredDeposit: 0m);
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.TotalPaid.Should().Be(0m);
            result.Data.RemainingBalance.Should().Be(10000m);
            await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithNullRequiredDeposit_DoesNotRegisterInitialPayment()
        {
            var request = BuildValidRequest(requiredDeposit: null);
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.TotalPaid.Should().Be(0m);
            result.Data.RemainingBalance.Should().Be(10000m);
            await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_CreatesSaleWithDefaultPendingStatusAndActiveTrue()
        {
            var request = BuildValidRequest();
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.Received(1).CreateAsync(
                Arg.Is<SaleEntity>(s =>
                    s.ClientId == 1 &&
                    s.ProviderId == 2 &&
                    s.ReservationNumber == "RES-2026-001" &&
                    s.Description == "Paquete Cancún todo incluido" &&
                    s.TotalAmount == 10000m &&
                    !s.IsDollar &&
                    s.ProfitPercentage == 12.5m &&
                    s.RequiredDeposit == null &&
                    s.FinalPaymentDueDate == new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc) &&
                    s.TravelDate == new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc) &&
                    s.ReturnDate == new DateTime(2026, 9, 22, 12, 0, 0, DateTimeKind.Utc) &&
                    s.Status == "Pendiente" &&
                    s.Active),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_MapsResponseWithClientProviderAndProfit()
        {
            var request = BuildValidRequest();
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(77);
            result.Data.ClientId.Should().Be(1);
            result.Data.ClientName.Should().Be("Juan Pérez");
            result.Data.ProviderId.Should().Be(2);
            result.Data.ProviderName.Should().Be("AeroTravel");
            result.Data.ReservationNumber.Should().Be("RES-2026-001");
            result.Data.Description.Should().Be("Paquete Cancún todo incluido");
            result.Data.TotalAmount.Should().Be(10000m);
            result.Data.ProfitPercentage.Should().Be(12.5m);
            result.Data.ProfitAmount.Should().Be(1250m);
            result.Data.RequiredDeposit.Should().BeNull();
            result.Data.FinalPaymentDueDate.Should().Be(new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc));
            result.Data.TravelDate.Should().Be(new DateTime(2026, 9, 15, 12, 0, 0, DateTimeKind.Utc));
            result.Data.ReturnDate.Should().Be(new DateTime(2026, 9, 22, 12, 0, 0, DateTimeKind.Utc));
            result.Data.Active.Should().BeTrue();
        }

        [Fact]
        public async Task Handle_WithCustomStatus_UsesProvidedStatus()
        {
            var request = BuildValidRequest(status: "Confirmada");
            SetupSuccessfulCreation(request);

            var result = await _handler.Handle(new CreateSaleCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Status.Should().Be("Confirmada");
            await _saleRepository.Received(1).CreateAsync(
                Arg.Is<SaleEntity>(s => s.Status == "Confirmada"),
                Arg.Any<CancellationToken>());
        }
    }
}
