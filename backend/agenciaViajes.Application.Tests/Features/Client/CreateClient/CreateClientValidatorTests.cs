using agenciaViajes.Application.Features.Client.CreateClient;
using FluentAssertions;
using agenciaViajes.Application.Features.Client.Common.Requests;

namespace agenciaViajes.Application.Tests.Features.Client.CreateClient
{
    public class CreateClientValidatorTests
    {
        private readonly CreateClientValidator _validator = new();

        private static CreateClientRequest BuildValidRequest() => new()
        {
            Name = "Juan",
            LastName = "Pérez",
            Address = "Calle Falsa 123",
            Phone = "+56912345678",
            Email = "juan.perez@test.com",
            BirthDate = new DateOnly(1990, 5, 15)
        };

        [Fact]
        public void Validate_WithValidRequest_ShouldPass()
        {
            var result = _validator.Validate(BuildValidRequest());
            result.IsValid.Should().BeTrue();
            result.Errors.Should().BeEmpty();
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Validate_WithNameEmpty_ShouldFail(string? name)
        {
            var request = BuildValidRequest();
            request.Name = name!;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Name" && e.ErrorMessage == "El nombre es obligatorio");
        }

        [Fact]
        public void Validate_WithNameTooLong_ShouldFail()
        {
            var request = BuildValidRequest();
            request.Name = new string('a', 201);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Name" && e.ErrorMessage == "El nombre no puede superar los 200 caracteres");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Validate_WithLastNameEmpty_ShouldFail(string? lastName)
        {
            var request = BuildValidRequest();
            request.LastName = lastName!;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "LastName" && e.ErrorMessage == "El apellido es obligatorio");
        }

        [Fact]
        public void Validate_WithLastNameTooLong_ShouldFail()
        {
            var request = BuildValidRequest();
            request.LastName = new string('b', 201);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "LastName" && e.ErrorMessage == "El apellido no puede superar los 200 caracteres");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void Validate_WithEmailNullOrEmpty_ShouldPass(string? email)
        {
            var request = BuildValidRequest();
            request.Email = email;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "Email");
        }

        [Theory]
        [InlineData("sin-arroba")]
        [InlineData("@dominio.com")]
        [InlineData("usuario@")]
        public void Validate_WithEmailInvalidFormat_ShouldFail(string? email)
        {
            var request = BuildValidRequest();
            request.Email = email;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "El email no es válido");
        }

        [Fact]
        public void Validate_WithEmailTooLong_ShouldFail()
        {
            var request = BuildValidRequest();
            request.Email = new string('x', 250) + "@mail.com";
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Email" && e.ErrorMessage == "El email no puede superar los 255 caracteres");
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public void Validate_WithPhoneEmpty_ShouldFail(string? phone)
        {
            var request = BuildValidRequest();
            request.Phone = phone!;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Phone" && e.ErrorMessage == "El teléfono es obligatorio");
        }

        [Fact]
        public void Validate_WithPhoneTooLong_ShouldFail()
        {
            var request = BuildValidRequest();
            request.Phone = new string('9', 21);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Phone" && e.ErrorMessage == "El teléfono no puede superar los 20 caracteres");
        }

        [Fact]
        public void Validate_WithAddressTooLong_ShouldFail()
        {
            var request = BuildValidRequest();
            request.Address = new string('c', 501);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "Address" && e.ErrorMessage == "La dirección no puede superar los 500 caracteres");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        public void Validate_WithAddressNullOrEmpty_ShouldPass(string? address)
        {
            var request = BuildValidRequest();
            request.Address = address;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "Address");
        }

        [Fact]
        public void Validate_WithFutureBirthDate_ShouldFail()
        {
            var request = BuildValidRequest();
            request.BirthDate = DateOnly.FromDateTime(DateTime.Today).AddDays(1);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeFalse();
            result.Errors.Should().Contain(e => e.PropertyName == "BirthDate" && e.ErrorMessage == "La fecha de nacimiento no puede ser mayor a la fecha actual");
        }

        [Fact]
        public void Validate_WithBirthDateEqualToToday_ShouldPass()
        {
            var request = BuildValidRequest();
            request.BirthDate = DateOnly.FromDateTime(DateTime.Today);
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "BirthDate");
        }

        [Fact]
        public void Validate_WithBirthDateNull_ShouldPass()
        {
            var request = BuildValidRequest();
            request.BirthDate = null;
            var result = _validator.Validate(request);
            result.IsValid.Should().BeTrue();
            result.Errors.Should().NotContain(e => e.PropertyName == "BirthDate");
        }
    }
}
