using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using MediatR;

namespace agenciaViajes.Application.Features.Client.DeleteClient
{
    public class DeleteClientHandler : IRequestHandler<DeleteClientCommand, Result>
    {
        private readonly IClientRepository _clientRepository;

        public DeleteClientHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task<Result> Handle(DeleteClientCommand request, CancellationToken cancellationToken)
        {
            var deleted = await _clientRepository.DeleteAsync(request.Id, cancellationToken);

            if (!deleted)
            {
                return Result.Failure("Cliente no encontrado");
            }

            return Result.Success();
        }
    }
}
