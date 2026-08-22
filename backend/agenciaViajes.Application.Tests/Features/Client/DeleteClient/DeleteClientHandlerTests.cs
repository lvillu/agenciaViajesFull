using agenciaViajes.Application.Features.Client.DeleteClient;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;

namespace agenciaViajes.Application.Tests.Features.Client.DeleteClient
{
    public class DeleteClientHandlerTests
    {
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly DeleteClientHandler _handler;

        public DeleteClientHandlerTests()
        {
            _handler = new DeleteClientHandler(_clientRepository);
        }

        [Fact]
        public async Task Handle_WhenClientDeleted_ReturnsSuccess()
        {
            _clientRepository.DeleteAsync(3, Arg.Any<CancellationToken>()).Returns(true);

            var result = await _handler.Handle(new DeleteClientCommand(3), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            await _clientRepository.Received(1).DeleteAsync(3, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenClientNotFound_ReturnsFailure()
        {
            _clientRepository.DeleteAsync(99, Arg.Any<CancellationToken>()).Returns(false);

            var result = await _handler.Handle(new DeleteClientCommand(99), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Cliente no encontrado");
            await _clientRepository.Received(1).DeleteAsync(99, Arg.Any<CancellationToken>());
        }
    }
}
