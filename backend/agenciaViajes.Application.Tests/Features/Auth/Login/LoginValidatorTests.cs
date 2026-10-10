using agenciaViajes.Application.Features.Auth.Common.Requests;
using agenciaViajes.Application.Features.Auth.Login;
using FluentAssertions;

namespace agenciaViajes.Application.Tests.Features.Auth.Login;

public class LoginValidatorTests
{
    private readonly LoginValidator _validator = new();

    private static AuthRequest BuildValidRequest() => new()
    {
        username = "jperez",
        password = "Secreta123!"
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
    [InlineData("   ")]
    public void Validate_WhenUsernameMissing_Fails(string? username)
    {
        var request = BuildValidRequest();
        request.username = username!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(AuthRequest.username));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_WhenPasswordMissing_Fails(string? password)
    {
        var request = BuildValidRequest();
        request.password = password!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(AuthRequest.password));
    }
}
