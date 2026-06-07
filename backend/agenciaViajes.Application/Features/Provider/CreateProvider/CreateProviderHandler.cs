using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.CreateProvider
{
    public class CreateProviderHandler : IRequestHandler<CreateProviderCommand, Result<ProviderResponse>>
    {
        private readonly IProviderRepository _providerRepository;
        private readonly IAccountService _accountService;

        public CreateProviderHandler(
            IProviderRepository providerRepository,
            IAccountService accountService)
        {
            _providerRepository = providerRepository;
            _accountService = accountService;
        }

        public async Task<Result<ProviderResponse>> Handle(CreateProviderCommand request, CancellationToken cancellationToken)
        {
            // Validar que no exista un proveedor con el mismo nombre
            var exists = await _providerRepository.ExistsByNameAsync(request.Request.Name, null, cancellationToken);
            if (exists)
            {
                return Result<ProviderResponse>.Failure("Ya existe un proveedor con ese nombre");
            }

            // Crear entidad con account isolation
            var provider = new Domain.Entities.Provider
            {
                Name = request.Request.Name,
                Acronym = request.Request.Acronym,
                Email = request.Request.Email,
                Phone = request.Request.Phone,
                ProviderContactName = request.Request.ProviderContactName,
                DepositPercentage = request.Request.DepositPercentage,
                FinalPaymentDaysBefore = request.Request.FinalPaymentDaysBefore,
                ProfitPercentage = request.Request.ProfitPercentage,
                Active = true,
                AccountId = _accountService.AccountId
            };

            provider = await _providerRepository.CreateAsync(provider, cancellationToken);

            // Mapear a response
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
                ProfitPercentage = provider.ProfitPercentage,
                Active = provider.Active
            };

            return Result<ProviderResponse>.Success(response, "Proveedor creado exitosamente");
        }
    }
}
