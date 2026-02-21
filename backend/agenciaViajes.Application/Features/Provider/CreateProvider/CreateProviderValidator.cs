using agenciaViajes.Application.Features.Provider.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Provider.CreateProvider
{
    public class CreateProviderValidator : AbstractValidator<CreateProviderRequest>
    {
        public CreateProviderValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres");

            RuleFor(x => x.Acronym)
                .NotEmpty().WithMessage("El acrónimo es obligatorio")
                .MaximumLength(10).WithMessage("El acrónimo no puede superar los 10 caracteres");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El email es obligatorio")
                .EmailAddress().WithMessage("El email no es válido")
                .MaximumLength(255).WithMessage("El email no puede superar los 255 caracteres");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("El teléfono es obligatorio")
                .MaximumLength(20).WithMessage("El teléfono no puede superar los 20 caracteres");

            RuleFor(x => x.ProviderContactName)
                .NotEmpty().WithMessage("El nombre del contacto es obligatorio")
                .MaximumLength(200).WithMessage("El nombre del contacto no puede superar los 200 caracteres");
        }
    }
}
