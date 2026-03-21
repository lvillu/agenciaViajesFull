using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientsList
{
    public class GetClientsListHandler : IRequestHandler<GetClientsListQuery, Result<List<ClientResponse>>>
    {
        private readonly IClientRepository _clientRepository;

        public GetClientsListHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task<Result<List<ClientResponse>>> Handle(GetClientsListQuery request, CancellationToken cancellationToken)
        {
            var clients = await _clientRepository.GetAllAsync(request.IncludeInactive, cancellationToken);

            var response = clients.Select(c => new ClientResponse
            {
                Id = c.Id,
                Name = c.Name,
                LastName = c.LastName,
                Address = c.Address,
                Phone = c.Phone,
                Email = c.Email,
                BirthDate = c.BirthDate,
                Active = c.Active
            }).ToList();

            return Result<List<ClientResponse>>.Success(response);
        }
    }
}
