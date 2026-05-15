using agenciaViajes.Application.Features.AgencyInfo.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.AgencyInfo.UpdateAgencyInfo
{
    public class UpdateAgencyInfoValidator : AbstractValidator<UpdateAgencyInfoRequest>
    {
        public UpdateAgencyInfoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre de la agencia es obligatorio")
                .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres");

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("El email no tiene un formato válido")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.Phone)
                .MaximumLength(30).WithMessage("El teléfono no puede superar los 30 caracteres")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.ZipCode)
                .MaximumLength(10).WithMessage("El código postal no puede superar los 10 caracteres")
                .When(x => !string.IsNullOrEmpty(x.ZipCode));
        }
    }
}
