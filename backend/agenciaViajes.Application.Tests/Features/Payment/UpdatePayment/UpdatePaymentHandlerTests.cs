using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.UpdatePayment;
using FluentAssertions;
using NSubstitute;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;
using PaymentTypeEnum = agenciaViajes.Application.Domain.Entities.PaymentType;
using SaleEntity = agenciaViajes.Application.Domain.Entities.Sale;

namespace agenciaViajes.Application.Tests.Features.Payment.UpdatePayment;

public class UpdatePaymentHandlerTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
    private readonly UpdatePaymentHandler _handler;

    public UpdatePaymentHandlerTests()
    {
        _handler = new UpdatePaymentHandler(_paymentRepository, _saleRepository);
    }

    private static UpdatePaymentRequest BuildValidRequest(int saleId = 1, decimal amount = 6000m) => new()
    {
        SaleId = saleId,
        PaymentDate = new DateTime(2026, 5, 20, 14, 0, 0, DateTimeKind.Utc),
        Amount = amount,
        ExchangeRate = 18.4m,
        AmountMXN = amount * 18.4m,
        TransactionFee = 10m,
        Notes = "Pago actualizado"
    };

    [Fact]
    public async Task Handle_WhenPaymentNotFound_ReturnsFailure()
    {
        var request = BuildValidRequest();
        _paymentRepository.GetByIdAsync(50, Arg.Any<CancellationToken>()).Returns((PaymentEntity?)null);

        var result = await _handler.Handle(new UpdatePaymentCommand(50, request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Pago no encontrado");
        await _paymentRepository.DidNotReceive().UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenSaleNotFound_ReturnsFailure()
    {
        var request = BuildValidRequest(saleId: 77);
        var payment = new PaymentEntity { Id = 1, SaleId = 1, Amount = 1000m };
        _paymentRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(payment);
        _saleRepository.GetByIdAsync(77, Arg.Any<CancellationToken>()).Returns((SaleEntity?)null);

        var result = await _handler.Handle(new UpdatePaymentCommand(1, request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("La venta especificada no existe");
        await _paymentRepository.DidNotReceive().UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenNewAmountExceedsBalance_ReturnsFailure()
    {
        var request = BuildValidRequest(amount: 9999m);
        var payment = new PaymentEntity { Id = 1, SaleId = 1, Amount = 4000m };
        var sale = new SaleEntity { Id = 1, TotalAmount = 10000m };
        _paymentRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(payment);
        _saleRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(1, Arg.Any<CancellationToken>()).Returns(5000m);

        var result = await _handler.Handle(new UpdatePaymentCommand(1, request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("excede el saldo pendiente");
        await _paymentRepository.DidNotReceive().UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenSameSale_ExcludesCurrentPaymentFromBalance()
    {
        var request = BuildValidRequest(saleId: 1, amount: 6000m);
        var payment = new PaymentEntity { Id = 1, SaleId = 1, Amount = 4000m };
        var sale = new SaleEntity { Id = 1, TotalAmount = 10000m };
        _paymentRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(payment);
        _saleRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(1, Arg.Any<CancellationToken>()).Returns(5000m);
        _paymentRepository.UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new UpdatePaymentCommand(1, request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Amount.Should().Be(6000m);
        result.Data.PaymentType.Should().Be((int)PaymentTypeEnum.Abono);

        await _paymentRepository.Received(1).UpdateAsync(
            Arg.Is<PaymentEntity>(p =>
                p.Id == 1 &&
                p.SaleId == 1 &&
                p.Amount == 6000m),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenMovingToAnotherSale_DoesNotExcludeCurrentAmount()
    {
        var request = BuildValidRequest(saleId: 2, amount: 250m);
        var payment = new PaymentEntity { Id = 1, SaleId = 1, Amount = 4000m };
        var targetSale = new SaleEntity
        {
            Id = 2,
            TotalAmount = 300m,
            ReservationNumber = "RES-002",
            Client = new agenciaViajes.Application.Domain.Entities.Client { Name = "Sofía", LastName = "Díaz" }
        };
        _paymentRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(payment);
        _saleRepository.GetByIdAsync(2, Arg.Any<CancellationToken>()).Returns(targetSale);
        _saleRepository.GetTotalPaidAsync(2, Arg.Any<CancellationToken>()).Returns(50m);
        _paymentRepository.UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new UpdatePaymentCommand(1, request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.SaleId.Should().Be(2);
        result.Data.SaleReservationNumber.Should().Be("RES-002");
        result.Data.ClientName.Should().Be("Sofía Díaz");

        await _paymentRepository.Received(1).UpdateAsync(
            Arg.Is<PaymentEntity>(p => p.SaleId == 2 && p.Amount == 250m),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenFirstPaymentOnTargetSale_PaymentTypeIsAnticipo()
    {
        var request = BuildValidRequest(saleId: 2, amount: 100m);
        var payment = new PaymentEntity { Id = 1, SaleId = 1, Amount = 4000m };
        var sale = new SaleEntity { Id = 2, TotalAmount = 500m };
        _paymentRepository.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(payment);
        _saleRepository.GetByIdAsync(2, Arg.Any<CancellationToken>()).Returns(sale);
        _saleRepository.GetTotalPaidAsync(2, Arg.Any<CancellationToken>()).Returns(0m);
        _paymentRepository.UpdateAsync(Arg.Any<PaymentEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<PaymentEntity>());

        var result = await _handler.Handle(new UpdatePaymentCommand(1, request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.PaymentType.Should().Be((int)PaymentTypeEnum.Anticipo);
        result.Message.Should().Be("Pago actualizado exitosamente");
    }
}
