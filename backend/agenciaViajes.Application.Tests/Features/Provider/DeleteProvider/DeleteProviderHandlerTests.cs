using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Provider.DeleteProvider;
using FluentAssertions;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Features.Provider.DeleteProvider;

public class DeleteProviderHandlerTests
{
    private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
    private readonly DeleteProviderHandler _handler;

    public DeleteProviderHandlerTests()
    {
        _handler = new DeleteProviderHandler(_providerRepository);
    }

    [Fact]
    public async Task Handle_WhenProviderDeleted_ReturnsSuccess()
    {
        _providerRepository.DeleteAsync(1, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(new DeleteProviderCommand(1), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        await _providerRepository.Received(1).DeleteAsync(1, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenProviderNotFound_ReturnsFailure()
    {
        _providerRepository.DeleteAsync(99, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.Handle(new DeleteProviderCommand(99), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Proveedor no encontrado");
    }
}
