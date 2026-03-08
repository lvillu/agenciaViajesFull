using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.GetProviderById
{
    public class GetProviderByIdHandler : IRequestHandler<GetProviderByIdQuery, Result<ProviderResponse>>
    {
        private readonly IProviderRepository _providerRepository;

        public GetProviderByIdHandler(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        public async Task<Result<ProviderResponse>> Handle(GetProviderByIdQuery request, CancellationToken cancellationToken)
        {
            var provider = await _providerRepository.GetByIdAsync(request.Id, cancellationToken);

            if (provider == null)
            {
                return Result<ProviderResponse>.Failure("Proveedor no encontrado");
            }

            var response = new ProviderResponse
            {
                Id = provider.Id,
                Name = provider.Name,
                Acronym = provider.Acronym,
                Email = provider.Email,
                Phone = provider.Phone,
                ProviderContactName = provider.ProviderContactName,
                DepositPercentage = provider.DepositPercentage,
                FinalPaymentDaysBefore = provider.FinalPaymentDaysBefore,
                Active = provider.Active
            };

            return Result<ProviderResponse>.Success(response);
        }
    }
}
