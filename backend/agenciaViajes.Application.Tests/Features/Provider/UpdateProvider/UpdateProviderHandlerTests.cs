using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.UpdateProvider;
using FluentAssertions;
using NSubstitute;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;

namespace agenciaViajes.Application.Tests.Features.Provider.UpdateProvider;

public class UpdateProviderHandlerTests
{
    private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
    private readonly UpdateProviderHandler _handler;

    public UpdateProviderHandlerTests()
    {
        _handler = new UpdateProviderHandler(_providerRepository);
    }

    private static UpdateProviderRequest BuildValidRequest() => new()
    {
        Name = "Proveedor Editado",
        Acronym = "PE",
        Email = "nuevo@proveedor.com",
        Phone = "5587654321",
        ProviderContactName = "Nuevo Contacto",
        DepositPercentage = 40m,
        FinalPaymentDaysBefore = 5,
        ProfitPercentage = 18m,
        Active = true
    };

    [Fact]
    public async Task Handle_WhenProviderNotFound_ReturnsFailure()
    {
        var command = new UpdateProviderCommand(99, BuildValidRequest());
        _providerRepository.GetByIdAsync(99, Arg.Any<CancellationToken>()).Returns((ProviderEntity?)null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Proveedor no encontrado");
        await _providerRepository.DidNotReceive().UpdateAsync(Arg.Any<ProviderEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenNameUsedByAnotherProvider_ReturnsFailure()
    {
        var existing = new ProviderEntity { Id = 3, Name = "Viejo" };
        var command = new UpdateProviderCommand(3, BuildValidRequest());
        _providerRepository.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(existing);
        _providerRepository.ExistsByNameAsync(command.Request.Name, 3, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Ya existe otro proveedor con ese nombre");
        await _providerRepository.DidNotReceive().UpdateAsync(Arg.Any<ProviderEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenValid_UpdatesProviderAndReturnsResponse()
    {
        var existing = new ProviderEntity { Id = 3, Name = "Viejo", Active = false };
        var command = new UpdateProviderCommand(3, BuildValidRequest());
        _providerRepository.GetByIdAsync(3, Arg.Any<CancellationToken>()).Returns(existing);
        _providerRepository.ExistsByNameAsync(command.Request.Name, 3, Arg.Any<CancellationToken>()).Returns(false);
        _providerRepository.UpdateAsync(Arg.Any<ProviderEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<ProviderEntity>());

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Be("Proveedor actualizado exitosamente");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().Be(3);
        result.Data.Name.Should().Be(command.Request.Name);
        result.Data.Acronym.Should().Be(command.Request.Acronym);
        result.Data.Email.Should().Be(command.Request.Email);
        result.Data.Phone.Should().Be(command.Request.Phone);
        result.Data.ProviderContactName.Should().Be(command.Request.ProviderContactName);
        result.Data.DepositPercentage.Should().Be(command.Request.DepositPercentage);
        result.Data.FinalPaymentDaysBefore.Should().Be(command.Request.FinalPaymentDaysBefore);
        result.Data.ProfitPercentage.Should().Be(command.Request.ProfitPercentage);
        result.Data.Active.Should().BeTrue();

        await _providerRepository.Received(1).UpdateAsync(
            Arg.Is<ProviderEntity>(p =>
                p.Id == 3 &&
                p.Name == command.Request.Name &&
                p.Active),
            Arg.Any<CancellationToken>());
    }
}
