using agenciaViajes.Application.Domain.Middleware;
using agenciaViajes.Application.Features.Configurations;
using agenciaViajes.Application.Features.Configurations.Modules;
using agenciaViajes.Application.Infrastructure.Configurations;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureCors() // Registrar el servicio de CORS
    .AddFluentValidationConfig() // Configuracion de fluent validation
    .AddBehaivorConfig() // Se registran los pipelines
    .RepositoryManagerInjection() // Inyeccion de dependencias
    .AddSwagerExplorer() // Configuracion de swagger
    .AddAuthenticationAuthorization(builder.Configuration) // Configuracion de la autenticacion y autorizacion
    .AddApplication() //MediatR
    .AddAppConfig(builder.Configuration) // Toma parametros de AppSettings
    .InjectDbContext(builder.Configuration); // Coneccion a base de datos


Logging.AddLogging();

//builder.Host.UseSerilog();

var app = builder.Build();

// Aplicar migraciones automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var allMigrations = context.Database.GetMigrations().ToList();
        var pendingMigrations = (await context.Database.GetPendingMigrationsAsync()).ToList();
        Console.WriteLine($"[DIAG] Migrations in assembly: {allMigrations.Count} | Pending: {pendingMigrations.Count}");
        Console.WriteLine($"[DIAG] DbContext assembly: {context.GetType().Assembly.GetName().Name}");
        await context.Database.MigrateAsync();
        Console.WriteLine("[OK] Migraciones aplicadas correctamente");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Error al aplicar migraciones: {ex.Message}");
        throw;
    }
}

app.ConfigureSwaggerExplorer();

//app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

app.UseMiddleware<TokenValidationMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ExceptionMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

ModulesConfiguration.Configure(app);

app.Run();

