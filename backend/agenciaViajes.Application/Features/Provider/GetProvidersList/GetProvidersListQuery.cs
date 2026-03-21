using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProvidersList
{
    public sealed record GetProvidersListQuery(bool IncludeInactive = false) : IRequest<Result<List<ProviderResponse>>> { }
}
