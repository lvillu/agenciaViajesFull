using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.UpdatePayment;
using FluentAssertions;

namespace agenciaViajes.Application.Tests.Features.Payment.UpdatePayment;

public class UpdatePaymentValidatorTests
{
    private readonly UpdatePaymentValidator _validator = new();

    private static UpdatePaymentRequest BuildValidRequest() => new()
    {
        SaleId = 1,
        PaymentDate = new DateTime(2026, 4, 1, 9, 0, 0, DateTimeKind.Utc),
        Amount = 2000m
    };

    [Fact]
    public void Validate_WithValidRequest_IsValid()
    {
        var result = _validator.Validate(BuildValidRequest());
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void Validate_WhenSaleIdNotPositive_Fails(int saleId)
    {
        var request = BuildValidRequest();
        request.SaleId = saleId;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdatePaymentRequest.SaleId));
    }

    [Fact]
    public void Validate_WhenAmountNotPositive_Fails()
    {
        var request = BuildValidRequest();
        request.Amount = 0m;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdatePaymentRequest.Amount));
    }

    [Fact]
    public void Validate_WhenPaymentDateIsDefault_Fails()
    {
        var request = BuildValidRequest();
        request.PaymentDate = default;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdatePaymentRequest.PaymentDate));
    }

    [Fact]
    public void Validate_WhenExchangeRateNotPositive_Fails()
    {
        var request = BuildValidRequest();
        request.ExchangeRate = 0m;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdatePaymentRequest.ExchangeRate));
    }

    [Fact]
    public void Validate_WhenExchangeRateIsNull_Passes()
    {
        var request = BuildValidRequest();
        request.ExchangeRate = null;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_WhenAmountMxnNotPositive_Fails()
    {
        var request = BuildValidRequest();
        request.AmountMXN = 0m;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdatePaymentRequest.AmountMXN));
    }
}
