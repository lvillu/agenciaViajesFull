using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSalesList
{
    public sealed record GetSalesListQuery(bool IncludeInactive = false, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResponse<SaleResponse>>> { }
}
