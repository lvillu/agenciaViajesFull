using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.CreateClient
{
    public class CreateClientHandler : IRequestHandler<CreateClientCommand, Result<ClientResponse>>
    {
        private readonly IClientRepository _clientRepository;
        private readonly IAccountService _accountService;

        public CreateClientHandler(
            IClientRepository clientRepository,
            IAccountService accountService)
        {
            _clientRepository = clientRepository;
            _accountService = accountService;
        }

        public async Task<Result<ClientResponse>> Handle(CreateClientCommand request, CancellationToken cancellationToken)
        {
            // Validar que no exista un cliente con el mismo email
            var exists = await _clientRepository.ExistsByEmailAsync(request.Request.Email, null, cancellationToken);
            if (exists)
            {
                return Result<ClientResponse>.Failure("Ya existe un cliente con ese email");
            }

            // Crear entidad con account isolation
            var client = new Domain.Entities.Client
            {
                Name = request.Request.Name,
                LastName = request.Request.LastName,
                Address = request.Request.Address,
                Phone = request.Request.Phone,
                Email = request.Request.Email,
                BirthDate = request.Request.BirthDate,
                Active = true,
                AccountId = _accountService.AccountId
            };

            client = await _clientRepository.CreateAsync(client, cancellationToken);

            // Mapear a response
            var response = new ClientResponse
            {
                Id = client.Id,
                Name = client.Name,
                LastName = client.LastName,
                Address = client.Address,
                Phone = client.Phone,
                Email = client.Email,
                BirthDate = client.BirthDate,
                Active = client.Active
            };

            return Result<ClientResponse>.Success(response, "Cliente creado exitosamente");
        }
    }
}
