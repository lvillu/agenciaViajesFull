using agenciaViajes.Application.Features.Client.CreateClient;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Requests;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;

namespace agenciaViajes.Application.Tests.Features.Client.CreateClient
{
    public class CreateClientHandlerTests
    {
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly CreateClientHandler _handler;

        public CreateClientHandlerTests()
        {
            _handler = new CreateClientHandler(_clientRepository);
        }

        private static CreateClientRequest BuildValidRequest(string? email = "juan.perez@test.com") => new()
        {
            Name = "Juan",
            LastName = "Pérez",
            Address = "Calle Falsa 123",
            Phone = "+56912345678",
            Email = email,
            BirthDate = new DateOnly(1990, 5, 15)
        };

        [Fact]
        public async Task Handle_WithEmailAvailable_ReturnsSuccessAndCreatesClient()
        {
            var request = BuildValidRequest();
            _clientRepository
                .ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(false);
            _clientRepository
                .CreateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(c => c.ArgAt<ClientEntity>(0));

            var result = await _handler.Handle(new CreateClientCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Message.Should().Be("Cliente creado exitosamente");
            await _clientRepository.Received(1).ExistsByEmailAsync("juan.perez@test.com", null, Arg.Any<CancellationToken>());
            await _clientRepository.Received(1).CreateAsync(
                Arg.Is<ClientEntity>(c =>
                    c.Name == "Juan" &&
                    c.LastName == "Pérez" &&
                    c.Address == "Calle Falsa 123" &&
                    c.Phone == "+56912345678" &&
                    c.Email == "juan.perez@test.com" &&
                    c.BirthDate == new DateOnly(1990, 5, 15) &&
                    c.Active),
                Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithoutEmail_SkipsDuplicateCheckAndCreatesClient()
        {
            var request = BuildValidRequest(email: null);
            _clientRepository
                .CreateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(c => c.ArgAt<ClientEntity>(0));

            var result = await _handler.Handle(new CreateClientCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Active.Should().BeTrue();
            await _clientRepository.DidNotReceive().ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>());
            await _clientRepository.Received(1).CreateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithExistingEmail_ReturnsFailureWithoutCreating()
        {
            var request = BuildValidRequest();
            _clientRepository
                .ExistsByEmailAsync(Arg.Any<string?>(), Arg.Any<int?>(), Arg.Any<CancellationToken>())
                .Returns(true);

            var result = await _handler.Handle(new CreateClientCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeFalse();
            result.Status.Should().Be(ResultConstants.FAILURE_STATUS);
            result.Message.Should().Be("Ya existe un cliente con ese email");
            result.Data.Should().BeNull();
            await _clientRepository.DidNotReceive().CreateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_OnSuccess_MapsRepositoryOutputToResponse()
        {
            var request = BuildValidRequest(email: null);
            var created = new ClientEntity
            {
                Id = 99,
                Name = "JUAN",
                LastName = "PÉREZ GÓMEZ",
                Address = "Nueva Dirección 456",
                Phone = "+56987654321",
                Email = "normalizado@test.com",
                BirthDate = new DateOnly(1990, 1, 1),
                Active = true
            };
            _clientRepository
                .CreateAsync(Arg.Any<ClientEntity>(), Arg.Any<CancellationToken>())
                .Returns(created);

            var result = await _handler.Handle(new CreateClientCommand(request), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(99);
            result.Data.Name.Should().Be("JUAN");
            result.Data.LastName.Should().Be("PÉREZ GÓMEZ");
            result.Data.Address.Should().Be("Nueva Dirección 456");
            result.Data.Phone.Should().Be("+56987654321");
            result.Data.Email.Should().Be("normalizado@test.com");
            result.Data.BirthDate.Should().Be(new DateOnly(1990, 1, 1));
            result.Data.Active.Should().BeTrue();
        }
    }
}
