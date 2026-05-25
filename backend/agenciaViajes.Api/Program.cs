using agenciaViajes.Application.Domain.Middleware;
using agenciaViajes.Application.Features.Configurations;
using agenciaViajes.Application.Features.Configurations.Modules;
using agenciaViajes.Application.Infrastructure.Configurations;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq;

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

// Aplicar migraciones automáticamente al iniciar (con logs diagnósticos)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Diagnostics: listar ensamblados cargados y migraciones detectadas
        try
        {
            var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies().Select(a => a.GetName().Name).OrderBy(n => n);
            Console.WriteLine("[DIAG] Assemblies cargados: " + string.Join(", ", loadedAssemblies));
        }
        catch { /* no bloquear arranque por diagnóstico */ }

        try
        {
            var migrations = context.Database.GetMigrations();
            var pending = context.Database.GetPendingMigrations();
            Console.WriteLine("[DIAG] Migrations encontradas: " + string.Join(", ", migrations));
            Console.WriteLine("[DIAG] Migrations pendientes: " + string.Join(", ", pending));
        }
        catch (Exception diagEx)
        {
            Console.WriteLine($"[DIAG] Error al listar migraciones: {diagEx.Message}");
        }

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

