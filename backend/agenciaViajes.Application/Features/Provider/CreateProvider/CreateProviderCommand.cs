using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.CreateProvider
{
    public sealed record CreateProviderCommand(CreateProviderRequest Request) : IRequest<Result<ProviderResponse>>, ITransactionalCommand { }
}
