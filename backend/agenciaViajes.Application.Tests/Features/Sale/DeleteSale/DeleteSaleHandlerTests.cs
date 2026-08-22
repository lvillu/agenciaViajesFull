using agenciaViajes.Application.Features.Sale.DeleteSale;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;

namespace agenciaViajes.Application.Tests.Features.Sale.DeleteSale
{
    public class DeleteSaleHandlerTests
    {
        private readonly ISaleRepository _saleRepository = Substitute.For<ISaleRepository>();
        private readonly DeleteSaleHandler _handler;

        public DeleteSaleHandlerTests()
        {
            _handler = new DeleteSaleHandler(_saleRepository);
        }

        [Fact]
        public async Task Handle_WhenSaleDeleted_ReturnsSuccess()
        {
            _saleRepository
                .DeleteAsync(10, Arg.Any<CancellationToken>())
                .Returns(true);

            var result = await _handler.Handle(new DeleteSaleCommand(10), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            await _saleRepository.Received(1).DeleteAsync(10, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenSaleNotFound_ReturnsFailure()
        {
            _saleRepository
                .DeleteAsync(99, Arg.Any<CancellationToken>())
                .Returns(false);

            var result = await _handler.Handle(new DeleteSaleCommand(99), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Venta no encontrada");
            await _saleRepository.Received(1).DeleteAsync(99, Arg.Any<CancellationToken>());
        }
    }
}
