using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSalesList
{
    public sealed record GetSalesListQuery(bool IncludeInactive = false) : IRequest<Result<List<SaleResponse>>> { }
}
