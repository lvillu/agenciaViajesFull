using agenciaViajes.Application.Features.Client.GetClientsList;
using FluentAssertions;
using NSubstitute;
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.Client.Common.Responses;
using ClientEntity = agenciaViajes.Application.Domain.Entities.Client;

namespace agenciaViajes.Application.Tests.Features.Client.GetClientsList
{
    public class GetClientsListHandlerTests
    {
        private readonly IClientRepository _clientRepository = Substitute.For<IClientRepository>();
        private readonly GetClientsListHandler _handler;

        public GetClientsListHandlerTests()
        {
            _handler = new GetClientsListHandler(_clientRepository);
        }

        [Fact]
        public async Task Handle_WhenClientsExist_ReturnsMappedPage()
        {
            var clients = new List<ClientEntity>
            {
                new()
                {
                    Id = 1,
                    Name = "Juan",
                    LastName = "Pérez",
                    Address = "Calle Falsa 123",
                    Phone = "+56911111111",
                    Email = "juan.perez@test.com",
                    BirthDate = new DateOnly(1990, 5, 15),
                    Active = true
                },
                new()
                {
                    Id = 2,
                    Name = "María",
                    LastName = "López",
                    Address = null,
                    Phone = "+56922222222",
                    Email = null,
                    BirthDate = null,
                    Active = false
                }
            };
            _clientRepository.GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>())
                .Returns((clients, 2));

            var result = await _handler.Handle(new GetClientsListQuery(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Status.Should().Be(ResultConstants.SUCCESS_STATUS);
            result.Data.Should().NotBeNull();
            result.Data!.Items.Should().HaveCount(2);
            result.Data.Total.Should().Be(2);
            result.Data.Items[0].Id.Should().Be(1);
            result.Data.Items[0].Name.Should().Be("Juan");
            result.Data.Items[0].LastName.Should().Be("Pérez");
            result.Data.Items[0].Address.Should().Be("Calle Falsa 123");
            result.Data.Items[0].Phone.Should().Be("+56911111111");
            result.Data.Items[0].Email.Should().Be("juan.perez@test.com");
            result.Data.Items[0].BirthDate.Should().Be(new DateOnly(1990, 5, 15));
            result.Data.Items[0].Active.Should().BeTrue();
            result.Data.Items[1].Id.Should().Be(2);
            result.Data.Items[1].Name.Should().Be("María");
            result.Data.Items[1].Address.Should().BeNull();
            result.Data.Items[1].Email.Should().BeNull();
            result.Data.Items[1].BirthDate.Should().BeNull();
            result.Data.Items[1].Active.Should().BeFalse();
            await _clientRepository.Received(1).GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WithIncludeInactiveTrue_ForwardsFlagToRepository()
        {
            _clientRepository.GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>())
                .Returns((new List<ClientEntity>(), 0));

            var result = await _handler.Handle(new GetClientsListQuery(true), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Data!.Items.Should().BeEmpty();
            await _clientRepository.Received(1).GetPagedAsync(1, 20, true, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_WhenNoClientsExist_ReturnsEmptySuccessPage()
        {
            _clientRepository.GetPagedAsync(1, 20, false, Arg.Any<CancellationToken>())
                .Returns((new List<ClientEntity>(), 0));

            var result = await _handler.Handle(new GetClientsListQuery(), CancellationToken.None);

            result.IsSuccess.Should().BeTrue();
            result.Message.Should().BeEmpty();
            result.Data.Should().NotBeNull();
            result.Data!.Items.Should().BeEmpty();
            result.Data.Total.Should().Be(0);
            await _clientRepository.DidNotReceiveWithAnyArgs().GetByIdAsync(default, default);
        }
    }
}
