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
    public async Task Handle_WhenTokenInvalidated_ReturnsTrue()
    {
        _authRepository.AuthLogOut("token-abc").Returns(true);

        var result = await _handler.Handle(new LogoutCommand("token-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeTrue();
        _authRepository.Received(1).AuthLogOut("token-abc");
    }

    [Fact]
    public async Task Handle_WhenTokenNotFound_ReturnsSuccessWithFalse()
    {
        _authRepository.AuthLogOut("token-missing").Returns(false);

        var result = await _handler.Handle(new LogoutCommand("token-missing"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().BeFalse();
    }
}
