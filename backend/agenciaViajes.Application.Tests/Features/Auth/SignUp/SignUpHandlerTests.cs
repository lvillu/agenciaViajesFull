using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.SignUp;
using FluentAssertions;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Features.Auth.SignUp;

public class SignUpHandlerTests
{
    private readonly IAuthRepository _authRepository = Substitute.For<IAuthRepository>();
    private readonly SignUpHandler _handler;

    public SignUpHandlerTests()
    {
        _handler = new SignUpHandler(_authRepository);
    }

    private static SignUpRequest BuildValidRequest() => new()
    {
        name = "Laura",
        lastName = "García",
        userName = "laura.g",
        email = "laura@mail.com",
        password = "Secreta1!",
        confirmPassword = "Secreta1!"
    };

    [Fact]
    public async Task Handle_WhenUserNameAlreadyExists_ReturnsFailure()
    {
        var request = BuildValidRequest();
        _authRepository.UserExistsAsync(request.userName, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(new SignUpCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be($"El nombre de usuario '{request.userName}' ya está registrado");
        await _authRepository.DidNotReceive().CreateUserAsync(Arg.Any<agenciaViajes.Application.Domain.Entities.User>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenValid_HashesPasswordAndCreatesActiveUser()
    {
        var request = BuildValidRequest();
        _authRepository.UserExistsAsync(request.userName, Arg.Any<CancellationToken>()).Returns(false);
        _authRepository.CreateUserAsync(Arg.Any<agenciaViajes.Application.Domain.Entities.User>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var entity = callInfo.Arg<agenciaViajes.Application.Domain.Entities.User>();
                entity.Id = 10;
                return entity;
            });

        var result = await _handler.Handle(new SignUpCommand(request), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Be("Usuario registrado exitosamente");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(10);
        result.Data.Name.Should().Be(request.name);
        result.Data.LastName.Should().Be(request.lastName);
        result.Data.UserName.Should().Be(request.userName);
        result.Data.Email.Should().Be(request.email);
        result.Data.Active.Should().BeTrue();

        await _authRepository.Received(1).CreateUserAsync(
            Arg.Is<agenciaViajes.Application.Domain.Entities.User>(u =>
                u.UserName == request.userName &&
                BCrypt.Net.BCrypt.Verify(request.password, u.PasswordHash) &&
                u.Active &&
                u.RefreshToken == null),
            Arg.Any<CancellationToken>());
    }
}
