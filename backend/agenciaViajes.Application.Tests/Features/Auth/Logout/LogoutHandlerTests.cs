using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Auth.Logout;
using FluentAssertions;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Features.Auth.Logout;

public class LogoutHandlerTests
{
    private readonly IAuthRepository _authRepository = Substitute.For<IAuthRepository>();
    private readonly LogoutHandler _handler;

    public LogoutHandlerTests()
    {
        _handler = new LogoutHandler(_authRepository);
    }

    [Fact]
    public async Task Handle_WhenRefreshTokenRevoked_ReturnsTrue()
    {
        _authRepository
            .RevokeRefreshTokenAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns(true);

        var result = await _handler.Handle(new LogoutCommand("token-abc", "refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeTrue();
        await _authRepository.Received(1).RevokeRefreshTokenAsync("refresh-abc", Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenRefreshTokenNotFound_ReturnsSuccessWithFalse()
    {
        _authRepository
            .RevokeRefreshTokenAsync("refresh-missing", Arg.Any<CancellationToken>())
            .Returns(false);

        var result = await _handler.Handle(new LogoutCommand("token-abc", "refresh-missing"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenNoRefreshToken_ReturnsSuccessWithFalseWithoutCallingRepository()
    {
        var result = await _handler.Handle(new LogoutCommand("token-abc", null), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeFalse();
        await _authRepository.DidNotReceive().RevokeRefreshTokenAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
