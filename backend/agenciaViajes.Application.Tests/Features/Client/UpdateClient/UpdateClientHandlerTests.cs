using agenciaViajes.Application.Features.Client.UpdateClient;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Requests;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;

namespace agenciaViajes.Application.Tests.Features.Client.UpdateClient
{
    public class UpdateClientHandlerTests
    {
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly UpdateClientHandler _handler;

        public UpdateClientHandlerTests()
        {
            _handler = new UpdateClientHandler(_clientRepository);
        }

        private static UpdateClientRequest BuildValidRequest(string? email = "ana.garcia@test.com") => new()
        {
            Name = "Ana",
            LastName = "García",
            Address = "Av Siempre Viva 742",
            Phone = "+56955511122",
            Email = email,
            BirthDate = new DateOnly(1985, 3, 20)
        };

        [Fact]
        public async Task Handle_WhenClientExists_ReturnsSuccessAndUpdatesEntity()
        {
            var request = BuildValidRequest();
            var existing = new ClientEntity { Id = 7, Name = "Viejo", LastName = "Nombre", Phone = "11111111", Active = true };
            _clientRepository.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns(existing);
            _clientRepository
                .ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(false);
            _clientRepository
                .UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(c => c.ArgAt<ClientEntity>(0));

            var result = await _handler.Handle(new UpdateClientCommand(7, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Message.Should().Be("Cliente actualizado exitosamente");
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(7);
            await _clientRepository.Received(1).GetByIdAsync(7, Arg.Any<CancellationToken>());
            await _clientRepository.Received(1).ExistsByEmailAsync("ana.garcia@test.com", 7, Arg.Any<CancellationToken>());
            await _clientRepository.Received(1).UpdateAsync(
                Arg.Is<ClientEntity>(c =>
                    c.Id == 7 &&
                    c.Name == "Ana" &&
                    c.LastName == "García" &&
                    c.Address == "Av Siempre Viva 742" &&
                    c.Phone == "+56955511122" &&
                    c.Email == "ana.garcia@test.com" &&
                    c.BirthDate == new DateOnly(1985, 3, 20) &&
                    c.Active),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenClientNotFound_ReturnsFailure()
        {
            var request = BuildValidRequest();
            _clientRepository.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns((ClientEntity?)null);

            var result = await _handler.Handle(new UpdateClientCommand(7, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Cliente no encontrado");
            result.Data.Should().BeNull();
            await _clientRepository.DidNotReceive().ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _clientRepository.DidNotReceive().UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenEmailUsedByOtherClient_ReturnsFailureWithoutUpdating()
        {
            var request = BuildValidRequest();
            var existing = new ClientEntity { Id = 7, Name = "Viejo", LastName = "Nombre", Phone = "11111111", Active = true };
            _clientRepository.GetByIdAsync(7, Arg.Any<CancellationToken>()).Returns(existing);
            _clientRepository
                .ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(true);

            var result = await _handler.Handle(new UpdateClientCommand(7, request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Ya existe otro cliente con ese email");
            result.Data.Should().BeNull();
            await _clientRepository.DidNotReceive().UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithoutEmail_SkipsDuplicateCheckAndUpdates()
        {
            var request = BuildValidRequest(email: null);
            var existing = new ClientEntity { Id = 3, Name = "Viejo", LastName = "Nombre", Phone = "11111111", Active = true };
            _clientRepository.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(existing);
            _clientRepository
                .UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(c => c.ArgAt<ClientEntity>(0));

            var result = await _handler.Handle(new UpdateClientCommand(3, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Be("Cliente actualizado exitosamente");
            await _clientRepository.DidNotReceive().ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _clientRepository.Received(1).UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_MapsRepositoryOutputToResponse()
        {
            var request = BuildValidRequest(email: null);
            var existing = new ClientEntity { Id = 12, Name = "Viejo", LastName = "Nombre", Phone = "11111111", Active = true };
            _clientRepository.GetByIdAsync(12, Arg.Any<CancellationToken>()).Returns(existing);
            var updated = new ClientEntity
            {
                Id = 12,
                Name = "ANA MARÍA",
                LastName = "GARCÍA LÓPEZ",
                Address = "Dirección Actualizada 999",
                Phone = "+56988877766",
                Email = "actualizada@test.com",
                BirthDate = new DateOnly(1985, 7, 7),
                Active = false
            };
            _clientRepository
                .UpdateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(updated);

            var result = await _handler.Handle(new UpdateClientCommand(12, request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(12);
            result.Data.Name.Should().Be("ANA MARÍA");
            result.Data.LastName.Should().Be("GARCÍA LÓPEZ");
            result.Data.Address.Should().Be("Dirección Actualizada 999");
            result.Data.Phone.Should().Be("+56988877766");
            result.Data.Email.Should().Be("actualizada@test.com");
            result.Data.BirthDate.Should().Be(new DateOnly(1985, 7, 7));
            result.Data.Active.Should().BeFalse();
        }
    }
}
