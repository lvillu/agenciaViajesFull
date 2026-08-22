using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Payment.GetPaymentsList;
using FluentAssertions;
using NSubstitute;
using PaymentEntity = agenciaViajes.Application.Domain.Entities.Payment;

namespace agenciaViajes.Application.Tests.Features.Payment.GetPaymentsList;

public class GetPaymentsListHandlerTests
{
    private readonly IPaymentRepository _paymentRepository = Substitute.For<IPaymentRepository>();
    private readonly GetPaymentsListHandler _handler;

    public GetPaymentsListHandlerTests()
    {
        _handler = new GetPaymentsListHandler(_paymentRepository);
    }

    [Fact]
    public async Task Handle_WithoutSaleId_UsesGetAll()
    {
        _paymentRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetPaymentsListQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Should().BeEmpty();
        await _paymentRepository.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
        await _paymentRepository.DidNotReceive().GetBySaleIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithSaleId_UsesGetBySaleId()
    {
        _paymentRepository.GetBySaleIdAsync(5, Arg.Any<CancellationToken>()).Returns([]);

        var result = await _handler.Handle(new GetPaymentsListQuery(5), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        await _paymentRepository.Received(1).GetBySaleIdAsync(5, Arg.Any<CancellationToken>());
        await _paymentRepository.DidNotReceive().GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenPaymentsExist_MapsResponsesWithSaleInfo()
    {
        var payments = new List<PaymentEntity>
        {
            new()
            {
                Id = 1, SaleId = 3, FolioNumber = 10,
                PaymentType = agenciaViajes.Application.Domain.Entities.PaymentType.Anticipo,
                Amount = 1500m, Notes = "Enganche",
                Sale = new agenciaViajes.Application.Domain.Entities.Sale
                {
                    Id = 3, ReservationNumber = "RES-100",
                    Client = new agenciaViajes.Application.Domain.Entities.Client { Name = "Ana", LastName = "Ruiz" }
                }
            },
            new()
            {
                Id = 2, SaleId = 4, FolioNumber = 11,
                PaymentType = agenciaViajes.Application.Domain.Entities.PaymentType.Abono,
                Amount = 800m, Sale = null
            }
        };
        _paymentRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(payments);

        var result = await _handler.Handle(new GetPaymentsListQuery(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].Id.Should().Be(1);
        result.Data[0].FolioNumber.Should().Be(10);
        result.Data[0].SaleReservationNumber.Should().Be("RES-100");
        result.Data[0].ClientName.Should().Be("Ana Ruiz");
        result.Data[1].Id.Should().Be(2);
        result.Data[1].SaleReservationNumber.Should().BeNull();
        result.Data[1].ClientName.Should().BeNull();
    }
}
