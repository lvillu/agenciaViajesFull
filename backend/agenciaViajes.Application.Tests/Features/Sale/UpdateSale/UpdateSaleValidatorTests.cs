using agenciaViajes.Application.Features.Sale.UpdateSale;
using FluentAssertions;
using agenciaViajes.Application.Features.Sale.Common.Requests;

namespace agenciaViajes.Application.Tests.Features.Sale.UpdateSale
{
    public class UpdateSaleValidatorTests
    {
        private readonly UpdateSaleValidator _validator = new();

        private static UpdateSaleRequest BuildValidRequest() => new()
        {
            ClientId = 1,
            ProviderId = 2,
            ReservationNumber = "RES-2026-001",
            Description = "Paquete Cancún todo incluido",
            TotalAmount = 10000m,
            IsDollar = false,
            ProfitPercentage = 12.5m,
            RequiredDeposit = 5000m,
            FinalPaymentDueDate = DateTime.Today.AddDays(-30),
            TravelDate = DateTime.Today,
            ReturnDate = DateTime.Today.AddDays(7)
        };

        [Fact]
        public void Validate_WithValidRequest_ShouldPass()
        {
            var result = _validator.Validate(BuildValidRequest());
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public void Validate_WithClientIdNotPositive_ShouldFail(int clientId)
        {
            var request = BuildValidRequest();
            request.ClientId = clientId;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "ClientId" && e.ErrorMessage == "Debe seleccionar un cliente");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public void Validate_WithProviderIdNotPositive_ShouldFail(int providerId)
        {
            var request = BuildValidRequest();
            request.ProviderId = providerId;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "ProviderId" && e.ErrorMessage == "Debe seleccionar un proveedor");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-100)]
        public void Validate_WithTotalAmountNotPositive_ShouldFail(decimal totalAmount)
        {
            var request = BuildValidRequest();
            request.TotalAmount = totalAmount;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "TotalAmount" && e.ErrorMessage == "El monto total debe ser mayor a 0");
        }

        [Fact]
        public void Validate_WithTravelDateBeforeToday_ShouldFail()
        {
            var request = BuildValidRequest();
            request.TravelDate = DateTime.Today.AddDays(-1);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "TravelDate" && e.ErrorMessage == "La fecha de viaje debe ser mayor o igual a hoy");
        }

        [Fact]
        public void Validate_WithTravelDateToday_ShouldPass()
        {
            var request = BuildValidRequest();
            request.TravelDate = DateTime.Today;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "TravelDate");
        }

        [Fact]
        public void Validate_WithReturnDateBeforeTravelDate_ShouldFail()
        {
            var request = BuildValidRequest();
            request.TravelDate = DateTime.Today.AddDays(7);
            request.ReturnDate = DateTime.Today.AddDays(6);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "ReturnDate" && e.ErrorMessage == "La fecha de retorno debe ser mayor o igual a la fecha de viaje");
        }

        [Fact]
        public void Validate_WithReturnDateEqualToTravelDate_ShouldPass()
        {
            var request = BuildValidRequest();
            request.ReturnDate = request.TravelDate;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "ReturnDate");
        }

        [Fact]
        public void Validate_WithNullReturnDate_ShouldPass()
        {
            var request = BuildValidRequest();
            request.ReturnDate = null;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "ReturnDate");
        }

        [Fact]
        public void Validate_WithFinalPaymentDueDateAfterTravelDate_ShouldFail()
        {
            var request = BuildValidRequest();
            request.FinalPaymentDueDate = request.TravelDate.AddDays(1);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "FinalPaymentDueDate" && e.ErrorMessage == "La fecha de liquidación debe ser antes de la fecha de viaje");
        }

        [Fact]
        public void Validate_WithFinalPaymentDueDateEqualToTravelDate_ShouldPass()
        {
            var request = BuildValidRequest();
            request.FinalPaymentDueDate = request.TravelDate;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "FinalPaymentDueDate");
        }

        [Fact]
        public void Validate_WithNullFinalPaymentDueDate_ShouldPass()
        {
            var request = BuildValidRequest();
            request.FinalPaymentDueDate = null;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "FinalPaymentDueDate");
        }
    }
}
