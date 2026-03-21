using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.GetSaleById
{
    public sealed record GetSaleByIdQuery(int Id) : IRequest<Result<SaleResponse>> { }
}
