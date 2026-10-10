using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Payment.GetPaymentById;
using FluentAssertions;
using NSubstitute;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;

namespace agenciaViajes.Application.Tests.Features.Payment.GetPaymentById;

public class GetPaymentByIdHandlerTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly GetPaymentByIdHandler _handler;

    public GetPaymentByIdHandlerTests()
    {
        _handler = new GetPaymentByIdHandler(_paymentRepository);
    }

    [Fact]
    public async Task Handle_WhenPaymentNotFound_ReturnsFailure()
    {
        _paymentRepository.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((PaymentEntity?)null);

        var result = await _handler.Handle(new GetPaymentByIdQuery(99), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Pago no encontrado");
    }

    [Fact]
    public async Task Handle_WhenPaymentExists_ReturnsMappedResponse()
    {
        var payment = new PaymentEntity
        {
            Id = 7,
            SaleId = 3,
            FolioNumber = 15,
            PaymentType = agenciaViajes.Application.Domain.Entities.PaymentType.Liquidacion,
            Amount = 5000m,
            ExchangeRate = 18.2m,
            AmountMXN = 91000m,
            TransactionFee = 30m,
            Notes = "Cierre",
            Sale = new agenciaViajes.Application.Domain.Entities.Sale
            {
                Id = 3,
                ReservationNumber = "RES-300",
                Client = new agenciaViajes.Application.Domain.Entities.Client { Name = "Mario", LastName = "López" }
            }
        };
        _paymentRepository.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns(payment);

        var result = await _handler.Handle(new GetPaymentByIdQuery(7), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(7);
        result.Data.SaleId.Should().Be(3);
        result.Data.FolioNumber.Should().Be(15);
        result.Data.PaymentType.Should().Be((int)agenciaViajes.Application.Domain.Entities.PaymentType.Liquidacion);
        result.Data.Amount.Should().Be(5000m);
        result.Data.ExchangeRate.Should().Be(18.2m);
        result.Data.AmountMXN.Should().Be(91000m);
        result.Data.TransactionFee.Should().Be(30m);
        result.Data.Notes.Should().Be("Cierre");
        result.Data.SaleReservationNumber.Should().Be("RES-300");
        result.Data.ClientName.Should().Be("Mario López");
    }

    [Fact]
    public async Task Handle_WhenPaymentHasNoSale_NavigationFieldsAreNull()
    {
        var payment = new PaymentEntity { Id = 8, SaleId = 4, Sale = null };
        _paymentRepository.GetByIdAsync(8, Arg.Any<CancellationToken>()).Returns(payment);

        var result = await _handler.Handle(new GetPaymentByIdQuery(8), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.SaleReservationNumber.Should().BeNull();
        result.Data.ClientName.Should().BeNull();
    }
}
