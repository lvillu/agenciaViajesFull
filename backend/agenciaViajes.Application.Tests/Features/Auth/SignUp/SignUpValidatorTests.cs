using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.SignUp;
using FluentAssertions;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Features.Auth.SignUp;

public class SignUpValidatorTests
{
    private readonly SignUpValidator _validator = new();

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
    public void Validate_WithValidRequest_IsValid()
    {
        var result = _validator.Validate(BuildValidRequest());
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_WhenNameMissing_Fails(string? name)
    {
        var request = BuildValidRequest();
        request.name = name!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.name));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_WhenLastNameMissing_Fails(string? lastName)
    {
        var request = BuildValidRequest();
        request.lastName = lastName!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.lastName));
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData("us er")]
    [InlineData("usuario!")]
    public void Validate_WhenUserNameInvalid_Fails(string userName)
    {
        var request = BuildValidRequest();
        request.userName = userName;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.userName));
    }

    [Fact]
    public void Validate_WhenUserNameTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.userName = new string('a', 51);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.userName));
    }

    [Fact]
    public void Validate_WhenEmailInvalid_Fails()
    {
        var request = BuildValidRequest();
        request.email = "no-es-email";
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.email));
    }

    [Theory]
    [InlineData("Corta1!", false)]
    [InlineData("sinnumeros!", false)]
    [InlineData("SINMINUSCULA1!", false)]
    [InlineData("sinmayuscula1!", false)]
    [InlineData("Sinespecial1", false)]
    public void Validate_WhenPasswordWeak_Fails(string password, bool _)
    {
        var request = BuildValidRequest();
        request.password = password;
        request.confirmPassword = password;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.password));
    }

    [Fact]
    public void Validate_WhenConfirmPasswordDiffers_Fails()
    {
        var request = BuildValidRequest();
        request.confirmPassword = "OtraClave1!";
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(SignUpRequest.confirmPassword));
    }
}
