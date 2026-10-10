using agenciaViajes.Application.Infrastructure.Configurations;
using FluentAssertions;
using Microsoft.Extensions.Configuration;

namespace agenciaViajes.Application.Tests.Infrastructure.Configurations;

public class JwtSettingsValidatorTests
{
    private static IConfiguration BuildConfig(string? secret)
    {
        var values = new Dictionary<string, string?>();
        if (secret is not null)
            values["AppSettings:SecretKey"] = secret;
        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }

    [Fact]
    public void Validate_WithStrongSecret_DoesNotThrow()
    {
        var config = BuildConfig(new string('k', 64));

        var act = () => JwtSettingsValidator.Validate(config);

        act.Should().NotThrow();
    }

    [Fact]
    public void Validate_WithMissingSecret_Throws()
    {
        var config = BuildConfig(null);

        var act = () => JwtSettingsValidator.Validate(config);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*SECRET_KEY*");
    }

    [Fact]
    public void Validate_WithPublicDefaultSecret_Throws()
    {
        var config = BuildConfig("GiveASecretKeyHavingAtLeast32Characters");

        var act = () => JwtSettingsValidator.Validate(config);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Validate_WithExampleTemplateSecret_Throws()
    {
        var config = BuildConfig("CAMBIA_ESTO_POR_UNA_CLAVE_ALEATORIA_DE_AL_MENOS_64_CARACTERES_0123456789");

        var act = () => JwtSettingsValidator.Validate(config);

        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void Validate_WithShortSecret_Throws()
    {
        var config = BuildConfig(new string('k', 63));

        var act = () => JwtSettingsValidator.Validate(config);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*64*");
    }
}
