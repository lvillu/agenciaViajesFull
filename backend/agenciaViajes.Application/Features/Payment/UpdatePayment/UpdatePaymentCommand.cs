using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.UpdatePayment
{
    public sealed record UpdatePaymentCommand(int Id, UpdatePaymentRequest Request) : IRequest<Result<PaymentResponse>>, ITransactionalCommand { }
}
