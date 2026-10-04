using agenciaViajes.Application.Domain.Entities;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Refresh;
using FluentAssertions;
using NSubstitute;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Tests.Features.Auth.Refresh;

public class RefreshHandlerTests
{
    private readonly IAuthRepository _authRepository = Substitute.For<IAuthRepository>();
    private readonly RefreshHandler _handler;

    public RefreshHandlerTests()
    {
        _handler = new RefreshHandler(_authRepository);
    }

    private static RefreshToken BuildStoredToken(DateTime createdAt, DateTime expiresAt, bool revoked = false)
        => new()
        {
            Id = 1,
            UserId = 7,
            TokenHash = "hash-abc",
            CreatedAt = createdAt,
            ExpiresAt = expiresAt,
            IsRevoked = revoked,
            User = new UserEntity { Id = 7, UserName = "jperez", Active = true }
        };

    [Fact]
    public async Task Handle_WithValidToken_RotatesAndReturnsNewTokens()
    {
        var now = DateTime.UtcNow;
        var stored = BuildStoredToken(now, now.AddDays(7));
        _authRepository.GetRefreshTokenWithUserAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns(stored);
        _authRepository.RotateRefreshTokenAsync(stored, Arg.Any<CancellationToken>())
            .Returns("refresh-nuevo");
        _authRepository.GenerateToken(stored.User).Returns("jwt-nuevo");

        var result = await _handler.Handle(new RefreshCommand("refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
        result.Data.Should().NotBeNull();
        result.Data!.userName.Should().Be("jperez");
        result.Data.token.Should().Be("jwt-nuevo");
        result.Data.refreshToken.Should().Be("refresh-nuevo");
        result.Data.refreshTokenExpiresInSeconds.Should().Be(7 * 24 * 60 * 60);
        await _authRepository.Received(1).RotateRefreshTokenAsync(stored, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithEmptyToken_ReturnsFailure()
    {
        var result = await _handler.Handle(new RefreshCommand(""), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("No hay refresh token.");
        await _authRepository.DidNotReceive().GetRefreshTokenWithUserAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenTokenNotFound_ReturnsFailure()
    {
        _authRepository.GetRefreshTokenWithUserAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns((RefreshToken?)null);

        var result = await _handler.Handle(new RefreshCommand("refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Refresh token invalido.");
        result.Data.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WhenTokenRevoked_ReturnsFailure()
    {
        var now = DateTime.UtcNow;
        var stored = BuildStoredToken(now, now.AddDays(7), revoked: true);
        _authRepository.GetRefreshTokenWithUserAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns(stored);

        var result = await _handler.Handle(new RefreshCommand("refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Refresh token invalido.");
        await _authRepository.DidNotReceive().RotateRefreshTokenAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenTokenExpired_ReturnsFailure()
    {
        var now = DateTime.UtcNow;
        var stored = BuildStoredToken(now.AddDays(-7), now.AddMinutes(-1));
        _authRepository.GetRefreshTokenWithUserAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns(stored);

        var result = await _handler.Handle(new RefreshCommand("refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Refresh Token expiro.");
        await _authRepository.DidNotReceive().RotateRefreshTokenAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenUserInactive_ReturnsFailure()
    {
        var now = DateTime.UtcNow;
        var stored = BuildStoredToken(now, now.AddDays(7));
        stored.User.Active = false;
        _authRepository.GetRefreshTokenWithUserAsync("refresh-abc", Arg.Any<CancellationToken>())
            .Returns(stored);

        var result = await _handler.Handle(new RefreshCommand("refresh-abc"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Usuario inactivo.");
        await _authRepository.DidNotReceive().RotateRefreshTokenAsync(Arg.Any<RefreshToken>(), Arg.Any<CancellationToken>());
    }
}
