using agenciaViajes.Application.Features.Auth.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Auth.SignUp
{
    public class SignUpValidator : AbstractValidator<SignUpRequest>
    {
        public SignUpValidator()
        {
            RuleFor(x => x.name)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

            RuleFor(x => x.lastName)
                .NotEmpty().WithMessage("El apellido es obligatorio")
                .MaximumLength(100).WithMessage("El apellido no puede exceder 100 caracteres");

            RuleFor(x => x.userName)
                .NotEmpty().WithMessage("El nombre de usuario es obligatorio")
                .MinimumLength(3).WithMessage("El nombre de usuario debe tener al menos 3 caracteres")
                .MaximumLength(50).WithMessage("El nombre de usuario no puede exceder 50 caracteres")
                .Matches(@"^[a-zA-Z0-9._-]+$").WithMessage("El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos");

            RuleFor(x => x.email)
                .NotEmpty().WithMessage("El correo electrónico es obligatorio")
                .EmailAddress().WithMessage("El correo electrónico no es válido")
                .MaximumLength(255).WithMessage("El correo electrónico no puede exceder 255 caracteres");

            RuleFor(x => x.password)
                .NotEmpty().WithMessage("La contraseña es obligatoria")
                .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres")
                .Matches(@"[A-Z]").WithMessage("La contraseña debe contener al menos una letra mayúscula")
                .Matches(@"[a-z]").WithMessage("La contraseña debe contener al menos una letra minúscula")
                .Matches(@"[0-9]").WithMessage("La contraseña debe contener al menos un número")
                .Matches(@"[!@#$%^&*]").WithMessage("La contraseña debe contener al menos un carácter especial (!@#$%^&*)");

            RuleFor(x => x.confirmPassword)
                .NotEmpty().WithMessage("La confirmación de contraseña es obligatoria")
                .Equal(x => x.password).WithMessage("Las contraseñas no coinciden");
        }
    }
}
