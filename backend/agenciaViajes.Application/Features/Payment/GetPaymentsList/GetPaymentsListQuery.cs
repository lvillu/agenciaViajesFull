using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Payment.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Payment.GetPaymentsList
{
    public sealed record GetPaymentsListQuery(int? SaleId = null, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResponse<PaymentResponse>>> { }
}
