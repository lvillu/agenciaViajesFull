using agenciaViajes.Application.Features.Client.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.Client.CreateClient
{
    public class CreateClientValidator : AbstractValidator<CreateClientRequest>
    {
        public CreateClientValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(200).WithMessage("El nombre no puede superar los 200 caracteres");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("El apellido es obligatorio")
                .MaximumLength(200).WithMessage("El apellido no puede superar los 200 caracteres");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El email es obligatorio")
                .EmailAddress().WithMessage("El email no es válido")
                .MaximumLength(255).WithMessage("El email no puede superar los 255 caracteres");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("El teléfono es obligatorio")
                .MaximumLength(20).WithMessage("El teléfono no puede superar los 20 caracteres");

            RuleFor(x => x.Address)
                .MaximumLength(500).WithMessage("La dirección no puede superar los 500 caracteres")
                .When(x => !string.IsNullOrEmpty(x.Address));

            RuleFor(x => x.BirthDate)
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now))
                .WithMessage("La fecha de nacimiento no puede ser mayor a la fecha actual")
                .When(x => x.BirthDate.HasValue);
        }
    }
}
