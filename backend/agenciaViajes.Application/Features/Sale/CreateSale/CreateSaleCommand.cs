using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Sale.Common.Requests;
using agenciaViajes.Application.Features.Sale.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.CreateSale
{
    public sealed record CreateSaleCommand(CreateSaleRequest Request) : IRequest<Result<SaleResponse>>, ITransactionalCommand { }
}
