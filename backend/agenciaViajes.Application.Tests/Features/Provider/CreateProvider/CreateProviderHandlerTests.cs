using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Features.Provider.Common.Requests;
using agenciaViajes.Application.Features.Provider.CreateProvider;
using FluentAssertions;
using NSubstitute;
using ProviderEntity = agenciaViajes.Application.Domain.Entities.Provider;

namespace agenciaViajes.Application.Tests.Features.Provider.CreateProvider;

public class CreateProviderHandlerTests
{
    private readonly IProviderRepository _providerRepository = Substitute.For<IProviderRepository>();
    private readonly CreateProviderHandler _handler;

    public CreateProviderHandlerTests()
    {
        _handler = new CreateProviderHandler(_providerRepository);
    }

    private static CreateProviderRequest BuildValidRequest() => new()
    {
        Name = "Proveedor Uno",
        Acronym = "PU",
        Email = "contacto@proveedor.com",
        Phone = "5512345678",
        ProviderContactName = "Contacto Proveedor",
        DepositPercentage = 30m,
        FinalPaymentDaysBefore = 7,
        ProfitPercentage = 15m
    };

    [Fact]
    public async Task Handle_WhenNameAlreadyExists_ReturnsFailure()
    {
        var command = new CreateProviderCommand(BuildValidRequest());
        _providerRepository.ExistsByNameAsync(command.Request.Name, null, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Be("Ya existe un proveedor con ese nombre");
        await _providerRepository.DidNotReceive().CreateAsync(Arg.Any<ProviderEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesProviderAndReturnsResponse()
    {
        var command = new CreateProviderCommand(BuildValidRequest());
        _providerRepository.ExistsByNameAsync(command.Request.Name, null, Arg.Any<CancellationToken>()).Returns(false);
        _providerRepository.CreateAsync(Arg.Any<ProviderEntity>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<ProviderEntity>());

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Be("Proveedor creado exitosamente");
        result.Data.Should().NotBeNull();
        result.Data!.Name.Should().Be(command.Request.Name);
        result.Data.Acronym.Should().Be(command.Request.Acronym);
        result.Data.Email.Should().Be(command.Request.Email);
        result.Data.Phone.Should().Be(command.Request.Phone);
        result.Data.ProviderContactName.Should().Be(command.Request.ProviderContactName);
        result.Data.DepositPercentage.Should().Be(command.Request.DepositPercentage);
        result.Data.FinalPaymentDaysBefore.Should().Be(command.Request.FinalPaymentDaysBefore);
        result.Data.ProfitPercentage.Should().Be(command.Request.ProfitPercentage);
        result.Data.Active.Should().BeTrue();

        await _providerRepository.Received(1).CreateAsync(
            Arg.Is<ProviderEntity>(p =>
                p.Name == command.Request.Name &&
                p.Acronym == command.Request.Acronym &&
                p.Email == command.Request.Email &&
                p.Active),
            Arg.Any<CancellationToken>());
    }
}
