using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.DeletePayment
{
    public sealed record DeletePaymentCommand(int Id) : IRequest<Result>, ITransactionalCommand { }
}
