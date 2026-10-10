using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProvidersList
{
    public class GetProvidersListHandler : IRequestHandler<GetProvidersListQuery, Result<PagedResponse<ProviderResponse>>>
    {
        private readonly IProviderRepository _providerRepository;

        public GetProvidersListHandler(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        public async Task<Result<PagedResponse<ProviderResponse>>> Handle(GetProvidersListQuery request, CancellationToken cancellationToken)
        {
            var (page, pageSize) = Paging.Normalize(request.Page, request.PageSize);
            var (items, total) = await _providerRepository.GetPagedAsync(page, pageSize, request.IncludeInactive, cancellationToken);

            var response = items.Select(p => new ProviderResponse
            {
                Id = p.Id,
                Name = p.Name,
                Acronym = p.Acronym,
                Email = p.Email,
                Phone = p.Phone,
                ProviderContactName = p.ProviderContactName,
                DepositPercentage = p.DepositPercentage,
                FinalPaymentDaysBefore = p.FinalPaymentDaysBefore,
                ProfitPercentage = p.ProfitPercentage,
                Active = p.Active
            }).ToList();

            return Result<PagedResponse<ProviderResponse>>.Success(new PagedResponse<ProviderResponse>
            {
                Items = response,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }
    }
}
