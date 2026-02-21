using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Provider.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.UpdateProvider
{
    public class UpdateProviderHandler : IRequestHandler<UpdateProviderCommand, Result<ProviderResponse>>
    {
        private readonly IProviderRepository _providerRepository;

        public UpdateProviderHandler(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        public async Task<Result<ProviderResponse>> Handle(UpdateProviderCommand request, CancellationToken cancellationToken)
        {
            // Verificar que el proveedor existe
            var provider = await _providerRepository.GetByIdAsync(request.Id, cancellationToken);
            if (provider == null)
            {
                return Result<ProviderResponse>.Failure("Proveedor no encontrado");
            }

            // Validar que no exista otro proveedor con el mismo nombre
            var exists = await _providerRepository.ExistsByNameAsync(request.Request.Name, request.Id, cancellationToken);
            if (exists)
            {
                return Result<ProviderResponse>.Failure("Ya existe otro proveedor con ese nombre");
            }

            // Actualizar propiedades
            provider.Name = request.Request.Name;
            provider.Acronym = request.Request.Acronym;
            provider.Email = request.Request.Email;
            provider.Phone = request.Request.Phone;
            provider.ProviderContactName = request.Request.ProviderContactName;
            provider.Active = request.Request.Active;

            provider = await _providerRepository.UpdateAsync(provider, cancellationToken);

            // Mapear a response
            var response = new ProviderResponse
            {
                Id = provider.Id,
                Name = provider.Name,
                Acronym = provider.Acronym,
                Email = provider.Email,
                Phone = provider.Phone,
                ProviderContactName = provider.ProviderContactName,
                Active = provider.Active
            };

            return Result<ProviderResponse>.Success(response, "Proveedor actualizado exitosamente");
        }
    }
}
