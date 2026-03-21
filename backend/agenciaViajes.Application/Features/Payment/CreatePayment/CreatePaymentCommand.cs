using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Requests;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.CreatePayment
{
    public sealed record CreatePaymentCommand(CreatePaymentRequest Request) : IRequest<Result<PaymentResponse>>, ITransactionalCommand { }
}
