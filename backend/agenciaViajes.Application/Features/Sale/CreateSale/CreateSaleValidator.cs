using agenciaViajes.Application.Features.Sale.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Sale.CreateSale
{
    public class CreateSaleValidator : AbstractValidator<CreateSaleRequest>
    {
        public CreateSaleValidator()
        {
            RuleFor(x => x.ClientId)
                .GreaterThan(0).WithMessage("Debe seleccionar un cliente");

            RuleFor(x => x.ProviderId)
                .GreaterThan(0).WithMessage("Debe seleccionar un proveedor");

            RuleFor(x => x.TotalAmount)
                .GreaterThan(0).WithMessage("El monto total debe ser mayor a 0");

            RuleFor(x => x.TravelDate)
                .GreaterThanOrEqualTo(DateTime.Today).WithMessage("La fecha de viaje debe ser mayor o igual a hoy");

            RuleFor(x => x.ReturnDate)
                .GreaterThanOrEqualTo(x => x.TravelDate)
                .When(x => x.ReturnDate.HasValue)
                .WithMessage("La fecha de retorno debe ser mayor o igual a la fecha de viaje");

            RuleFor(x => x.FinalPaymentDueDate)
                .LessThanOrEqualTo(x => x.TravelDate)
                .When(x => x.FinalPaymentDueDate.HasValue)
                .WithMessage("La fecha de liquidación debe ser antes de la fecha de viaje");
        }
    }
}
