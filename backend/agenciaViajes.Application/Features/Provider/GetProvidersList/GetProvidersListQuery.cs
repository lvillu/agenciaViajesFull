using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProvidersList
{
    public sealed record GetProvidersListQuery(bool IncludeInactive = false, int Page = 1, int PageSize = 20) : IRequest<Result<PagedResponse<ProviderResponse>>> { }
}
