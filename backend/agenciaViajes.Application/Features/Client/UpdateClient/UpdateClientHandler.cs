using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.UpdateClient
{
    public class UpdateClientHandler : IRequestHandler<UpdateClientCommand, Result<ClientResponse>>
    {
        private readonly IClientRepository _clientRepository;

        public UpdateClientHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task<Result<ClientResponse>> Handle(UpdateClientCommand request, CancellationToken cancellationToken)
        {
            // Buscar cliente existente
            var client = await _clientRepository.GetByIdAsync(request.Id, cancellationToken);
            if (client == null)
            {
                return Result<ClientResponse>.Failure("Cliente no encontrado");
            }

            // Validar que no exista otro cliente con el mismo email (solo si se proporcionó)
            if (!string.IsNullOrEmpty(request.Request.Email))
            {
                var exists = await _clientRepository.ExistsByEmailAsync(request.Request.Email, request.Id, cancellationToken);
                if (exists)
                {
                    return Result<ClientResponse>.Failure("Ya existe otro cliente con ese email");
                }
            }

            // Actualizar propiedades
            client.Name = request.Request.Name;
            client.LastName = request.Request.LastName;
            client.Address = request.Request.Address;
            client.Phone = request.Request.Phone;
            client.Email = request.Request.Email;
            client.BirthDate = request.Request.BirthDate;

            client = await _clientRepository.UpdateAsync(client, cancellationToken);

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

            return Result<ClientResponse>.Success(response, "Cliente actualizado exitosamente");
        }
    }
}
