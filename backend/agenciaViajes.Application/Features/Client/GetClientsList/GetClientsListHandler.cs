using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.Client.GetClientsList
{
    public class GetClientsListHandler : IRequestHandler<GetClientsListQuery, Result<PagedResponse<ClientResponse>>>
    {
        private readonly IClientRepository _clientRepository;

        public GetClientsListHandler(IClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task<Result<PagedResponse<ClientResponse>>> Handle(GetClientsListQuery request, CancellationToken cancellationToken)
        {
            var (page, pageSize) = Paging.Normalize(request.Page, request.PageSize);
            var (items, total) = await _clientRepository.GetPagedAsync(page, pageSize, request.IncludeInactive, cancellationToken);

            var response = items.Select(c => new ClientResponse
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

            return Result<PagedResponse<ClientResponse>>.Success(new PagedResponse<ClientResponse>
            {
                Items = response,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }
    }
}
