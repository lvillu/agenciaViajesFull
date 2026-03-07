using agenciaViajes.Application.Features.Payment.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Payment.CreatePayment
{
    public class CreatePaymentValidator : AbstractValidator<CreatePaymentRequest>
    {
        public CreatePaymentValidator()
        {
            RuleFor(x => x.SaleId)
                .GreaterThan(0).WithMessage("Debe seleccionar una venta");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("El monto debe ser mayor a 0");

            RuleFor(x => x.PaymentDate)
                .NotEmpty().WithMessage("La fecha de pago es obligatoria");

            RuleFor(x => x.ExchangeRate)
                .GreaterThan(0)
                .When(x => x.ExchangeRate.HasValue)
                .WithMessage("El tipo de cambio debe ser mayor a 0");

            RuleFor(x => x.AmountMXN)
                .GreaterThan(0)
                .When(x => x.AmountMXN.HasValue)
                .WithMessage("El monto en MXN debe ser mayor a 0");
        }
    }
}
