using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.GetPaymentById
{
    public sealed record GetPaymentByIdQuery(int Id) : IRequest<Result<PaymentResponse>> { }
}
