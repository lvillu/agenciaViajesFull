using agenciaViajes.Application.Features.Client.GetClientById;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;

namespace agenciaViajes.Application.Tests.Features.Client.GetClientById
{
    public class GetClientByIdHandlerTests
    {
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly GetClientByIdHandler _handler;

        public GetClientByIdHandlerTests()
        {
            _handler = new GetClientByIdHandler(_clientRepository);
        }

        [Fact]
        public async Task Handle_WhenClientExists_ReturnsMappedResponse()
        {
            var client = new ClientEntity
            {
                Id = 12,
                Name = "Carlos",
                LastName = "Ruiz",
                Address = "Los Alerces 456",
                Phone = "+56933334444",
                Email = "carlos.ruiz@test.com",
                BirthDate = new DateOnly(1978, 11, 30),
                Active = true
            };
            _clientRepository.GetByIdAsync(12, Arg.Any<CancellationToken>()).Returns(client);

            var result = await _handler.Handle(new GetClientByIdQuery(12), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(12);
            result.Data.Name.Should().Be("Carlos");
            result.Data.LastName.Should().Be("Ruiz");
            result.Data.Address.Should().Be("Los Alerces 456");
            result.Data.Phone.Should().Be("+56933334444");
            result.Data.Email.Should().Be("carlos.ruiz@test.com");
            result.Data.BirthDate.Should().Be(new DateOnly(1978, 11, 30));
            result.Data.Active.Should().BeTrue();
            await _clientRepository.Received(1).GetByIdAsync(12, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenClientDoesNotExist_ReturnsFailure()
        {
            _clientRepository.GetByIdAsync(404, Arg.Any<CancellationToken>()).Returns((ClientEntity?)null);

            var result = await _handler.Handle(new GetClientByIdQuery(404), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Cliente no encontrado");
            result.Data.Should().BeNull();
            await _clientRepository.Received(1).GetByIdAsync(404, Arg.Any<CancellationToken>());
        }
    }
}
