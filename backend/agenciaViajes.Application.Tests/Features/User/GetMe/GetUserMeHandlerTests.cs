using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.User.GetMe;
using FluentAssertions;
using NSubstitute;
using UserEntity = agenciaViajes.Application.Domain.Entities.User;

namespace agenciaViajes.Application.Tests.Features.User.GetMe;

public class GetUserMeHandlerTests
{
    private readonly IAuthRepository _authRepository = Substitute.For<IAuthRepository>();
    private readonly GetUserMeHandler _handler;

    public GetUserMeHandlerTests()
    {
        _handler = new GetUserMeHandler(_authRepository);
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ReturnsFailure()
    {
        _authRepository.GetUserByUserNameAsync("desconocido", Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var result = await _handler.Handle(new GetUserMeQuery("desconocido"), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Usuario no encontrado");
    }

    [Fact]
    public async Task Handle_WhenUserFound_ReturnsMappedResponse()
    {
        var user = new UserEntity
        {
            Id = 5,
            Name = "María",
            LastName = "Torres",
            UserName = "mtorres",
            Email = "maria@mail.com",
            UserIconUrl = "https://cdn/avatar.png"
        };
        _authRepository.GetUserByUserNameAsync("mtorres", Arg.Any<CancellationToken>()).Returns(user);

        var result = await _handler.Handle(new GetUserMeQuery("mtorres"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FullName.Should().Be("María Torres");
        result.Data.UserName.Should().Be("mtorres");
        result.Data.Email.Should().Be("maria@mail.com");
        result.Data.UserIconUrl.Should().Be("https://cdn/avatar.png");
    }

    [Fact]
    public async Task Handle_WhenUserHasNoIconUrl_ReturnsNullIconUrl()
    {
        var user = new UserEntity { Name = "Pedro", LastName = "Soto", UserName = "psoto", Email = "p@s.com" };
        _authRepository.GetUserByUserNameAsync("psoto", Arg.Any<CancellationToken>()).Returns(user);

        var result = await _handler.Handle(new GetUserMeQuery("psoto"), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.UserIconUrl.Should().BeNull();
    }
}
