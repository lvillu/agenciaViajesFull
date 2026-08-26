using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.CreateProvider;
using FluentAssertions;

namespace agenciaViajes.Application.Tests.Features.Provider.CreateProvider;

public class CreateProviderValidatorTests
{
    private readonly CreateProviderValidator _validator = new();

    private static CreateProviderRequest BuildValidRequest() => new()
    {
        Name = "Proveedor Uno",
        Acronym = "PU",
        Email = "contacto@proveedor.com",
        Phone = "5512345678",
        ProviderContactName = "Contacto Proveedor"
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
    public void Validate_WhenNameMissing_Fails(string? name)
    {
        var request = BuildValidRequest();
        request.Name = name!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Name));
    }

    [Fact]
    public void Validate_WhenNameTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.Name = new string('a', 201);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Name));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_WhenAcronymMissing_Fails(string? acronym)
    {
        var request = BuildValidRequest();
        request.Acronym = acronym!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Acronym));
    }

    [Fact]
    public void Validate_WhenAcronymTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.Acronym = new string('a', 11);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Acronym));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_WhenEmailMissing_Fails(string? email)
    {
        var request = BuildValidRequest();
        request.Email = email!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Email));
    }

    [Theory]
    [InlineData("no-es-email")]
    [InlineData("sin-arroba.com")]
    public void Validate_WhenEmailInvalidFormat_Fails(string email)
    {
        var request = BuildValidRequest();
        request.Email = email;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Email));
    }

    [Fact]
    public void Validate_WhenPhoneMissing_Fails()
    {
        var request = BuildValidRequest();
        request.Phone = "";
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Phone));
    }

    [Fact]
    public void Validate_WhenPhoneTooLong_Fails()
    {
        var request = BuildValidRequest();
        request.Phone = new string('1', 21);
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.Phone));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_WhenContactNameMissing_Fails(string? contact)
    {
        var request = BuildValidRequest();
        request.ProviderContactName = contact!;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProviderRequest.ProviderContactName));
    }

    [Fact]
    public void Validate_OptionalNumericFields_AcceptNulls()
    {
        var request = BuildValidRequest();
        request.DepositPercentage = null;
        request.FinalPaymentDaysBefore = null;
        request.ProfitPercentage = null;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }
}
