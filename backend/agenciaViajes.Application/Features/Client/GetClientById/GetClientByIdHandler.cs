using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientById
{
    public class GetClientByIdHandler : IRequestHandler<GetClientByIdQuery, Result<ClientResponse>>
    {
        private readonly IClientRepository _clientRepository;

        public GetClientByIdHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task<Result<ClientResponse>> Handle(GetClientByIdQuery request, CancellationToken cancellationToken)
        {
            var client = await _clientRepository.GetByIdAsync(request.Id, cancellationToken);

            if (client == null)
            {
                return Result<ClientResponse>.Failure("Cliente no encontrado");
            }

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

            return Result<ClientResponse>.Success(response);
        }
    }
}
