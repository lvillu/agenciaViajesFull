using FluentValidation;

namespace agenciaViajes.Application.Features.User.SetFolioStart;

public class SetFolioStartValidator : AbstractValidator<SetFolioStartCommand>
{
    public SetFolioStartValidator()
    {
        RuleFor(x => x.FolioStart)
            .GreaterThanOrEqualTo(1).WithMessage("El folio inicial debe ser mayor o igual a 1")
            .LessThanOrEqualTo(999999).WithMessage("El folio inicial no puede exceder 999,999");
    }
}
