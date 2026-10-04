using FluentValidation;

namespace agenciaViajes.Application.Features.Auth.Refresh
{
    public class RefreshValidator : AbstractValidator<RefreshCommand>
    {
        public RefreshValidator()
        {
            RuleFor(x => x.RefreshToken)
                .NotEmpty().WithMessage("Refresh token requerido");
        }
    }
}
