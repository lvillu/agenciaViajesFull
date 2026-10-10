using agenciaViajes.Application.Features.Auth.Login;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Tests.Features.Auth.Login
{
    public class LoginHandlerTests
    {
        private readonly IAuthRepository _authRepository = Substitute.For<IAuthRepository>();
        private readonly LoginHandler _handler;

        public LoginHandlerTests()
        {
            _handler = new LoginHandler(_authRepository);
        }

        private static LoginCommand BuildCommand() => new(new AuthRequest
        {
            username = "jperez",
            password = "Secreta123!"
        });

        [Fact]
        public async Task Handle_WithValidCredentials_ReturnsSuccessWithTokenAndUserName()
        {
            var user = new UserEntity { Id = 7, UserName = "jperez", Email = "jperez@test.com" };
            _authRepository
                .AuthLoginAsync("jperez", "Secreta123!", false, Arg.Any<CancellationToken>())
                .Returns((user, "jwt-token-abc", "refresh-token-abc"));
            _authRepository.GetRefreshTokenLifetime(false).Returns(TimeSpan.FromDays(7));

            var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Message.Should().BeEmpty();
            result.Data.Should().NotBeNull();
            result.Data!.userName.Should().Be("jperez");
            result.Data.token.Should().Be("jwt-token-abc");
            result.Data.refreshToken.Should().Be("refresh-token-abc");
            result.Data.refreshTokenExpiresInSeconds.Should().Be(7 * 24 * 60 * 60);
            await _authRepository.Received(1).AuthLoginAsync("jperez", "Secreta123!", false, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithRememberMe_UsesRememberMeLifetime()
        {
            var user = new UserEntity { Id = 7, UserName = "jperez", Email = "jperez@test.com" };
            var command = new LoginCommand(new AuthRequest
            {
                username = "jperez",
                password = "Secreta123!",
                rememberMe = true
            });

            _authRepository
                .AuthLoginAsync("jperez", "Secreta123!", true, Arg.Any<CancellationToken>())
                .Returns((user, "jwt-token-abc", "refresh-token-abc"));
            _authRepository.GetRefreshTokenLifetime(true).Returns(TimeSpan.FromDays(30));

            var result = await _handler.Handle(command, CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data!.refreshTokenExpiresInSeconds.Should().Be(30 * 24 * 60 * 60);
            await _authRepository.Received(1).AuthLoginAsync("jperez", "Secreta123!", true, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithUnknownUser_ReturnsFailureWithExactMessage()
        {
            UserEntity? user = null;
            string token = string.Empty;
            string refreshToken = string.Empty;
            _authRepository
                .AuthLoginAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<CancellationToken>())
                .Returns((user, token, refreshToken));

            var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Usuario o contraseña incorrectos");
            result.Data.Should().BeNull();
        }

        [Fact]
        public async Task Handle_WithEmptyToken_ReturnsFailureWithExactMessage()
        {
            var user = new UserEntity { Id = 7, UserName = "jperez" };
            _authRepository
                .AuthLoginAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<CancellationToken>())
                .Returns((user, string.Empty, string.Empty));

            var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Usuario o contraseña incorrectos");
            result.Data.Should().BeNull();
        }

        [Fact]
        public async Task Handle_WithNullUserAndToken_ReturnsFailureWithoutBuildingResponse()
        {
            UserEntity? user = null;
            string token = "jwt-token-xyz";
            _authRepository
                .AuthLoginAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<CancellationToken>())
                .Returns((user, token, "refresh-token-xyz"));

            var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Be("Usuario o contraseña incorrectos");
            result.Data.Should().BeNull();
            await _authRepository.Received(1).AuthLoginAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<bool>(), Arg.Any<CancellationToken>());
        }
    }
}
