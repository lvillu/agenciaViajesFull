using agenciaViajes.Application.Features.Auth.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Auth.Login
{
    public class LoginValidator : AbstractValidator<AuthRequest>
    {
        public LoginValidator()
        {
            RuleFor(x => x.username).NotEmpty().WithMessage("El usuario es obligatorio");
            RuleFor(x => x.password).NotEmpty().WithMessage("El password es obligatorio");
        }
    }
}
