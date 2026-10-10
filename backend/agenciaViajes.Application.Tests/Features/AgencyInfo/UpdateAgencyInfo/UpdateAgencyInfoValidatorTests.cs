using agenciaViajes.Application.Features.AgencyInfo.Common.Requests;
using agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo;
using FluentAssertions;

namespace agenciaViajes.Application.Tests.Features.AgencyInfo.UpdateAgencyInfo;

public class UpdateAgencyInfoValidatorTests
{
    private readonly UpdateAgencyInfoValidator _validator = new();

    private static UpdateAgencyInfoRequest BuildValidRequest() => new()
    {
        Name = "Mi Agencia"
    };

    [Fact]
    public void Validate_WithOnlyRequiredName_IsValid()
    {
        var result = _validator.Validate(BuildValidRequest());
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WhenNameMissing_Fails(string? name)
    {
        var request = BuildValidRequest();
        request.Name = name!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAgencyInfoRequest.Name));
    }

    [Fact]
    public void Validate_WhenNameTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.Name = new string('a', 201);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAgencyInfoRequest.Name));
    }

    [Theory]
    [InlineData("correo-invalido")]
    [InlineData("sin-arroba@")]
    public void Validate_WhenEmailFormatInvalid_Fails(string email)
    {
        var request = BuildValidRequest();
        request.Email = email;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAgencyInfoRequest.Email));
    }

    [Fact]
    public void Validate_WhenEmailEmpty_Passes()
    {
        var request = BuildValidRequest();
        request.Email = "";
        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WhenPhoneTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.Phone = new string('9', 31);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAgencyInfoRequest.Phone));
    }

    [Fact]
    public void Validate_WhenZipCodeTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.ZipCode = "12345678901";
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateAgencyInfoRequest.ZipCode));
    }
}
