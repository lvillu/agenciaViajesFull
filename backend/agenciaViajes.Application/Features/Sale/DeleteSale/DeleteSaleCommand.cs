using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Sale.DeleteSale
{
    public sealed record DeleteSaleCommand(int Id) : IRequest<Result>, ITransactionalCommand { }
}
