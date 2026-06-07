using agenciaViajes.Application.Features.User.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.User.CreateSubAccount
{
    public class CreateSubAccountValidator : AbstractValidator<CreateSubAccountRequest>
    {
        public CreateSubAccountValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("El nombre es requerido")
                .MaximumLength(100).WithMessage("Máximo 100 caracteres");

            RuleFor(x => x.lastName)
                .NotEmpty().WithMessage("El apellido es requerido")
                .MaximumLength(100).WithMessage("Máximo 100 caracteres");

            RuleFor(x => x.userName)
                .NotEmpty().WithMessage("El nombre de usuario es requerido")
                .MaximumLength(50).WithMessage("Máximo 50 caracteres");

            RuleFor(x => x.email)
                .NotEmpty().WithMessage("El email es requerido")
                .EmailAddress().WithMessage("Email inválido")
                .MaximumLength(255).WithMessage("Máximo 255 caracteres");

            RuleFor(x => x.password)
                .NotEmpty().WithMessage("La contraseña es requerida")
                .MinimumLength(8).WithMessage("Mínimo 8 caracteres")
                .Must(p => p.Any(char.IsUpper)).WithMessage("Debe contener al menos una mayúscula")
                .Must(p => p.Any(char.IsLower)).WithMessage("Debe contener al menos una minúscula")
                .Must(p => p.Any(char.IsDigit)).WithMessage("Debe contener al menos un número")
                .Must(p => p.Any(c => !char.IsLetterOrDigit(c))).WithMessage("Debe contener al menos un carácter especial");

            RuleFor(x => x.confirmPassword)
                .Equal(x => x.password).WithMessage("Las contraseñas no coinciden");
        }
    }
}
