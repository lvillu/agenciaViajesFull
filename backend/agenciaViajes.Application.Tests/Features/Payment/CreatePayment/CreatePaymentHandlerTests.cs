using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.CreatePayment;
using FluentAssertions;
using NSubstitute;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;
using PaymentTypeEnum = agenciaViajes.Application.Domain.Entities.PaymentType;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Payment.CreatePayment;

public class CreatePaymentHandlerTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
    private readonly CreatePaymentHandler _handler;

    public CreatePaymentHandlerTests()
    {
        _handler = new CreatePaymentHandler(_paymentRepository, _saleRepository);
    }

    private static SaleEntity BuildSale(int id = 1, decimal total = 10000m, bool withClient = true) => new()
    {
        Id = id,
        ReservationNumber = "RES-001",
        TotalAmount = total,
        Client = withClient
            ? new agenciaViajes.Application.Domain.Entities.Client { Id = 5, Name = "Laura", LastName = "García" }
            : null
    };

    private static CreatePaymentRequest BuildValidRequest(decimal amount = 3000m) => new()
    {
        SaleId = 1,
        PaymentDate = new DateTime(2026, 3, 10, 10, 30, 0, DateTimeKind.Utc),
        Amount = amount,
        ExchangeRate = 18.5m,
        AmountMXN = amount * 18.5m,
        TransactionFee = 25m,
        Notes = "Pago parcial"
    };

    [Fact]
    public async Task Handle_WhenSaleNotFound_ReturnsFailure()
    {
        var request = BuildValidRequest();
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns((SaleEntity?)null);

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("La venta especificada no existe");
        await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenAmountExceedsBalance_ReturnsFailure()
    {
        var sale = BuildSale(total: 10000m);
        var request = BuildValidRequest(amount: 9000m);
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(5000m);

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("excede el saldo pendiente");
        await _paymentRepository.DidNotReceive().CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenFirstPayment_PaymentTypeIsAnticipo()
    {
        var sale = BuildSale(total: 10000m);
        var request = BuildValidRequest(amount: 3000m);
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(0m);
        _paymentRepository.GetNextFolioNumberAsync(Arg.Any<CancellationToken>()).Returns(7);
        _paymentRepository.CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.PaymentType.Should().Be((int)PaymentTypeEnum.Anticipo);
        result.Data.PaymentTypeName.Should().Be(PaymentTypeEnum.Anticipo.ToString());
    }

    [Fact]
    public async Task Handle_WhenPartialPayment_PaymentTypeIsAbono()
    {
        var sale = BuildSale(total: 10000m);
        var request = BuildValidRequest(amount: 2000m);
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(3000m);
        _paymentRepository.GetNextFolioNumberAsync(Arg.Any<CancellationToken>()).Returns(8);
        _paymentRepository.CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.PaymentType.Should().Be((int)PaymentTypeEnum.Abono);
        result.Data.PaymentTypeName.Should().Be(PaymentTypeEnum.Abono.ToString());
    }

    [Fact]
    public async Task Handle_WhenAmountCoversBalance_PaymentTypeIsLiquidacion()
    {
        var sale = BuildSale(total: 10000m);
        var request = BuildValidRequest(amount: 7000m);
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(3000m);
        _paymentRepository.GetNextFolioNumberAsync(Arg.Any<CancellationToken>()).Returns(9);
        _paymentRepository.CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.PaymentType.Should().Be((int)PaymentTypeEnum.Liquidacion);
        result.Data.PaymentTypeName.Should().Be(PaymentTypeEnum.Liquidacion.ToString());
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesPaymentWithFolioAndMapsResponse()
    {
        var sale = BuildSale(total: 10000m);
        var request = BuildValidRequest(amount: 3000m);
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(0m);
        _paymentRepository.GetNextFolioNumberAsync(Arg.Any<CancellationToken>()).Returns(42);
        _paymentRepository.CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var entity = callInfo.Arg<PaymentEntity>();
                entity.Id = 100;
                return entity;
            });

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Be("Pago registrado exitosamente");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(100);
        result.Data.SaleId.Should().Be(request.SaleId);
        result.Data.FolioNumber.Should().Be(42);
        result.Data.Amount.Should().Be(request.Amount);
        result.Data.ExchangeRate.Should().Be(request.ExchangeRate);
        result.Data.TransactionFee.Should().Be(request.TransactionFee);
        result.Data.Notes.Should().Be(request.Notes);
        result.Data.SaleReservationNumber.Should().Be("RES-001");
        result.Data.ClientName.Should().Be("Laura García");

        await _paymentRepository.Received(1).CreateAsync(
            Arg.Is<PaymentEntity>(p =>
                p.SaleId == request.SaleId &&
                p.FolioNumber == 42 &&
                p.Amount == request.Amount &&
                p.Notes == request.Notes),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenSaleHasNoClient_ClientNameIsNull()
    {
        var sale = BuildSale(withClient: false);
        var request = BuildValidRequest();
        _saleRepository.GetByIdAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(request.SaleId, Arg.Any<CancellationToken>()).Returns(0m);
        _paymentRepository.GetNextFolioNumberAsync(Arg.Any<CancellationToken>()).Returns(1);
        _paymentRepository.CreateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new CreatePaymentCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.ClientName.Should().BeNull();
    }
}
