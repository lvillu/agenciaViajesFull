using agenciaViajes.Application.Features.Sale.UpdateSale;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Requests;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Sale.UpdateSale
{
    public class UpdateSaleHandlerTests
    {
        private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
        private readonly UpdateSaleHandler _handler;

        public UpdateSaleHandlerTests()
        {
            _handler = new UpdateSaleHandler(_saleRepository, _clientRepository, _providerRepository);
        }

        private static SaleEntity BuildExistingSale(int id = 50) => new()
        {
            Id = id,
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = "RES-OLD-001",
            Description = "Descripción original",
            TotalAmount = 8000m,
            IsDollar = false,
            ProfitPercentage = 10m,
            RequiredDeposit = 2000m,
            FinalPaymentDueDate = new DateTime(2026, 8, 1, 12, 0, 0, DateTimeKind.Utc),
            TravelDate = new DateTime(2026, 8, 10, 12, 0, 0, DateTimeKind.Utc),
            ReturnDate = new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc),
            Status = "Pendiente",
            Active = true,
            CreatedAt = new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc)
        };

        private static ClientEntity BuildClient(int id = 1) => new()
        {
            Id = id,
            Name = "María",
            LastName = "López",
            Phone = "+56955555555",
            Active = true
        };

        private static ProviderEntity BuildProvider(int id = 2) => new()
        {
            Id = id,
            Name = "EuroPass",
            Acronym = "EUP",
            Email = "info@europass.com",
            Phone = "+56944444444",
            ProviderContactName = "Luis Ruiz",
            Active = true
        };

        private static UpdateSaleRequest BuildValidUpdateRequest(string? reservationNumber = "RES-NEW-002", string? status = "Confirmada") => new()
        {
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = reservationNumber,
            Description = "Paquete Europa actualizado",
            TotalAmount = 12000m,
            IsDollar = false,
            ProfitPercentage = 15m,
            RequiredDeposit = 3000m,
            FinalPaymentDueDate = new DateTime(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc),
            TravelDate = new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc),
            ReturnDate = new DateTime(2026, 9, 20, 12, 0, 0, DateTimeKind.Utc),
            Status = status
        };

        private void SetupSuccessfulUpdate(UpdateSaleRequest request)
        {
            _saleRepository
                .GetByIdAsync(50, Arg.Any<CancellationToken>())
                .Returns(BuildExistingSale());
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
                .UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>())
                .Returns(c => c.ArgAt<SaleEntity>(0));
        }

        [Fact]
        public async Task Handle_WithNonExistentSale_ReturnsFailureWithoutUpdating()
        {
            var request = BuildValidUpdateRequest();
            _saleRepository
                .GetByIdAsync(50, Arg.Any<CancellationToken>())
                .Returns((SaleEntity?)null);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Venta no encontrada");
            result.Data.Should().BeNull();
            await _clientRepository.DidNotReceive().GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithNonExistentClient_ReturnsFailureWithoutUpdating()
        {
            var request = BuildValidUpdateRequest();
            _saleRepository
                .GetByIdAsync(50, Arg.Any<CancellationToken>())
                .Returns(BuildExistingSale());
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns((ClientEntity?)null);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("El cliente especificado no existe");
            result.Data.Should().BeNull();
            await _providerRepository.DidNotReceive().GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithNonExistentProvider_ReturnsFailureWithoutUpdating()
        {
            var request = BuildValidUpdateRequest();
            _saleRepository
                .GetByIdAsync(50, Arg.Any<CancellationToken>())
                .Returns(BuildExistingSale());
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns(BuildClient());
            _providerRepository
                .GetByIdAsync(2, Arg.Any<CancellationToken>())
                .Returns((ProviderEntity?)null);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("El proveedor especificado no existe");
            result.Data.Should().BeNull();
            await _saleRepository.DidNotReceive().ExistsByReservationNumberAsync(Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithChangedReservationNumberAlreadyUsed_ReturnsFailureWithoutUpdating()
        {
            var request = BuildValidUpdateRequest(reservationNumber: "RES-DUPLICADA");
            _saleRepository
                .GetByIdAsync(50, Arg.Any<CancellationToken>())
                .Returns(BuildExistingSale());
            _clientRepository
                .GetByIdAsync(1, Arg.Any<CancellationToken>())
                .Returns(BuildClient());
            _providerRepository
                .GetByIdAsync(2, Arg.Any<CancellationToken>())
                .Returns(BuildProvider());
            _saleRepository
                .ExistsByReservationNumberAsync("RES-DUPLICADA", Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(true);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Ya existe una venta con ese número de reserva");
            result.Data.Should().BeNull();
            await _saleRepository.Received(1).ExistsByReservationNumberAsync(
                "RES-DUPLICADA",
                Arg.Is<int?>(excludeId => excludeId == 50),
                Arg.Any<CancellationToken>());
            await _saleRepository.DidNotReceive().UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithUnchangedReservationNumber_SkipsDuplicateCheck()
        {
            var request = BuildValidUpdateRequest(reservationNumber: "RES-OLD-001");
            SetupSuccessfulUpdate(request);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.DidNotReceive().ExistsByReservationNumberAsync(Arg.Any<string>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _saleRepository.Received(1).UpdateAsync(Arg.Any<SaleEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithChangedAvailableReservationNumber_ChecksUniquenessExcludingCurrentSale()
        {
            var request = BuildValidUpdateRequest(reservationNumber: "RES-NEW-002");
            SetupSuccessfulUpdate(request);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.Received(1).ExistsByReservationNumberAsync(
                "RES-NEW-002",
                Arg.Is<int?>(excludeId => excludeId == 50),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_UpdatesEntityWithRequestValues()
        {
            var request = BuildValidUpdateRequest();
            SetupSuccessfulUpdate(request);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            await _saleRepository.Received(1).UpdateAsync(
                Arg.Is<SaleEntity>(s =>
                    s.Id == 50 &&
                    s.ClientId == 1 &&
                    s.ProviderId == 2 &&
                    s.ReservationNumber == "RES-NEW-002" &&
                    s.Description == "Paquete Europa actualizado" &&
                    s.TotalAmount == 12000m &&
                    !s.IsDollar &&
                    s.ProfitPercentage == 15m &&
                    s.RequiredDeposit == 3000m &&
                    s.FinalPaymentDueDate == new DateTime(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc) &&
                    s.TravelDate == new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc) &&
                    s.ReturnDate == new DateTime(2026, 9, 20, 12, 0, 0, DateTimeKind.Utc) &&
                    s.Status == "Confirmada" &&
                    s.Active &&
                    s.CreatedAt == new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc)),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_MapsResponseWithTotalsFromRepository()
        {
            var request = BuildValidUpdateRequest();
            SetupSuccessfulUpdate(request);
            _saleRepository
                .GetTotalPaidAsync(50, Arg.Any<CancellationToken>())
                .Returns(2500m);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Message.Should().Be("Venta actualizada exitosamente");
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(50);
            result.Data.ClientId.Should().Be(1);
            result.Data.ClientName.Should().Be("María López");
            result.Data.ProviderId.Should().Be(2);
            result.Data.ProviderName.Should().Be("EuroPass");
            result.Data.ReservationNumber.Should().Be("RES-NEW-002");
            result.Data.Description.Should().Be("Paquete Europa actualizado");
            result.Data.TotalAmount.Should().Be(12000m);
            result.Data.ProfitPercentage.Should().Be(15m);
            result.Data.ProfitAmount.Should().Be(1800m);
            result.Data.RequiredDeposit.Should().Be(3000m);
            result.Data.FinalPaymentDueDate.Should().Be(new DateTime(2026, 9, 1, 12, 0, 0, DateTimeKind.Utc));
            result.Data.TravelDate.Should().Be(new DateTime(2026, 9, 10, 12, 0, 0, DateTimeKind.Utc));
            result.Data.ReturnDate.Should().Be(new DateTime(2026, 9, 20, 12, 0, 0, DateTimeKind.Utc));
            result.Data.Status.Should().Be("Confirmada");
            result.Data.Active.Should().BeTrue();
            result.Data.CreatedAt.Should().Be(new DateTime(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc));
            result.Data.TotalPaid.Should().Be(2500m);
            result.Data.RemainingBalance.Should().Be(9500m);
        }

        [Fact]
        public async Task Handle_WithNullStatus_KeepsStatusNullWithoutDefaultFallback()
        {
            var request = BuildValidUpdateRequest(status: null);
            SetupSuccessfulUpdate(request);

            var result = await _handler.Handle(new UpdateSaleCommand(50, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Status.Should().BeNull();
            await _saleRepository.Received(1).UpdateAsync(
                Arg.Is<SaleEntity>(s => s.Status == null),
                Arg.Any<CancellationToken>());
        }
    }
}
