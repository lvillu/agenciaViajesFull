using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProviderById
{
    public sealed record GetProviderByIdQuery(int Id) : IRequest<Result<ProviderResponse>> { }
}
