using agenciaViajes.Application.Domain.Middleware;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace agenciaViajes.Application.Tests.Domain.Middleware;

public class ExceptionMiddlewareTests
{
    private static DefaultHttpContext BuildContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static async Task<string> ReadBodyAsync(HttpContext context)
    {
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(context.Response.Body);
        return await reader.ReadToEndAsync();
    }

    [Fact]
    public async Task Invoke_WhenUnhandledException_ReturnsGenericMessageWithoutLeakingDetails()
    {
        const string internalDetail = "secreto interno: tabla users password_hash";
        RequestDelegate next = _ => throw new InvalidOperationException(internalDetail);
        var logger = Substitute.For<ILogger<ExceptionMiddleware>>();
        var middleware = new ExceptionMiddleware(next, logger);
        var context = BuildContext();

        await middleware.Invoke(context);
        var body = await ReadBodyAsync(context);

        context.Response.StatusCode.Should().Be(500);
        // Nota: System.Text.Json escapa "ó" como \u00F3, por eso se aserta ASCII
        body.Should().Contain("error inesperado");
        body.Should().Contain("Ref:");
        body.Should().NotContain("secreto interno");
    }

    [Fact]
    public async Task Invoke_WhenNoException_PassesThrough()
    {
        RequestDelegate next = ctx =>
        {
            ctx.Response.StatusCode = 200;
            return Task.CompletedTask;
        };
        var logger = Substitute.For<ILogger<ExceptionMiddleware>>();
        var middleware = new ExceptionMiddleware(next, logger);
        var context = BuildContext();

        await middleware.Invoke(context);

        context.Response.StatusCode.Should().Be(200);
    }
}
