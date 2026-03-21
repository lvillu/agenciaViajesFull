using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.UpdateProvider
{
    public sealed record UpdateProviderCommand(int Id, UpdateProviderRequest Request) : IRequest<Result<ProviderResponse>>, ITransactionalCommand { }
}
