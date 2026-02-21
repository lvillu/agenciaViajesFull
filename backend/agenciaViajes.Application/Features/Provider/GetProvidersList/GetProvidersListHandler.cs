using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProvidersList
{
    public class GetProvidersListHandler : IRequestHandler<GetProvidersListQuery, Result<List<ProviderResponse>>>
    {
        private readonly IProviderRepository _providerRepository;

        public GetProvidersListHandler(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        public async Task<Result<List<ProviderResponse>>> Handle(GetProvidersListQuery request, CancellationToken cancellationToken)
        {
            var providers = await _providerRepository.GetAllAsync(request.IncludeInactive, cancellationToken);

            var response = providers.Select(p => new ProviderResponse
            {
                Id = p.Id,
                Name = p.Name,
                Acronym = p.Acronym,
                Email = p.Email,
                Phone = p.Phone,
                ProviderContactName = p.ProviderContactName,
                Active = p.Active
            }).ToList();

            return Result<List<ProviderResponse>>.Success(response);
        }
    }
}
