using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Provider.DeleteProvider
{
    public class DeleteProviderHandler : IRequestHandler<DeleteProviderCommand, Result>
    {
        private readonly IProviderRepository _providerRepository;

        public DeleteProviderHandler(IProviderRepository providerRepository)
        {
            _providerRepository = providerRepository;
        }

        public async Task<Result> Handle(DeleteProviderCommand request, CancellationToken cancellationToken)
        {
            var deleted = await _providerRepository.DeleteAsync(request.Id, cancellationToken);

            if (!deleted)
            {
                return Result.Failure("Proveedor no encontrado");
            }

            return Result.Success();
        }
    }
}
