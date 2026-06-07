using agenciaViajes.Application.Features.User.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.User.UpdateSubAccount
{
    public class UpdateSubAccountValidator : AbstractValidator<UpdateSubAccountRequest>
    {
        public UpdateSubAccountValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("El nombre es requerido")
                .MaximumLength(100).WithMessage("Máximo 100 caracteres");

            RuleFor(x => x.lastName)
                .NotEmpty().WithMessage("El apellido es requerido")
                .MaximumLength(100).WithMessage("Máximo 100 caracteres");

            RuleFor(x => x.email)
                .NotEmpty().WithMessage("El email es requerido")
                .EmailAddress().WithMessage("Email inválido")
                .MaximumLength(255).WithMessage("Máximo 255 caracteres");
        }
    }
}
