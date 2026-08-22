using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.CreatePayment;
using FluentAssertions;

namespace agenciaViajes.Application.Tests.Features.Payment.CreatePayment;

public class CreatePaymentValidatorTests
{
    private readonly CreatePaymentValidator _validator = new();

    private static CreatePaymentRequest BuildValidRequest() => new()
    {
        SaleId = 1,
        PaymentDate = new DateTime(2026, 3, 10, 10, 30, 0, DateTimeKind.Utc),
        Amount = 1500m
    };

    [Fact]
    public void Validate_WithValidRequest_IsValid()
    {
        var result = _validator.Validate(BuildValidRequest());
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenSaleIdNotPositive_Fails(int saleId)
    {
        var request = BuildValidRequest();
        request.SaleId = saleId;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.SaleId));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-100)]
    public void Validate_WhenAmountNotPositive_Fails(decimal amount)
    {
        var request = BuildValidRequest();
        request.Amount = amount;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.Amount));
    }

    [Fact]
    public void Validate_WhenPaymentDateIsDefault_Fails()
    {
        var request = BuildValidRequest();
        request.PaymentDate = default;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.PaymentDate));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Validate_WhenExchangeRateNotPositive_Fails(decimal exchangeRate)
    {
        var request = BuildValidRequest();
        request.ExchangeRate = exchangeRate;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.ExchangeRate));
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
        request.AmountMXN = -5m;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.AmountMXN));
    }

    [Theory]
    [InlineData(-1)]
    public void Validate_WhenTransactionFeeNegative_Fails(decimal fee)
    {
        var request = BuildValidRequest();
        request.TransactionFee = fee;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePaymentRequest.TransactionFee));
    }

    [Fact]
    public void Validate_WhenTransactionFeeZero_Passes()
    {
        var request = BuildValidRequest();
        request.TransactionFee = 0m;
        var result = _validator.Validate(request);
        result.IsValid.Should().BeTrue();
    }
}
