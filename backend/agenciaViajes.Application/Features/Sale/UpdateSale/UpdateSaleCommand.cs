using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Requests;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.UpdateSale
{
    public sealed record UpdateSaleCommand(int Id, UpdateSaleRequest Request) : IRequest<Result<SaleResponse>>, ITransactionalCommand { }
}
