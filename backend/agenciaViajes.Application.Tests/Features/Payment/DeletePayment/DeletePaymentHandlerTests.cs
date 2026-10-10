using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Payment.DeletePayment;
using FluentAssertions;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Features.Payment.DeletePayment;

public class DeletePaymentHandlerTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly DeletePaymentHandler _handler;

    public DeletePaymentHandlerTests()
    {
        _handler = new DeletePaymentHandler(_paymentRepository);
    }

    [Fact]
    public async Task Handle_WhenPaymentDeleted_ReturnsSuccess()
    {
        _paymentRepository.DeleteAsync(7, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(new DeletePaymentCommand(7), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        await _paymentRepository.Received(1).DeleteAsync(7, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenPaymentNotFound_ReturnsFailure()
    {
        _paymentRepository.DeleteAsync(99, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.Handle(new DeletePaymentCommand(99), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Pago no encontrado");
    }
}
