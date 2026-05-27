using agenciaViajes.Application.Domain.Middleware;
using agenciaViajes.Application.Features.Configurations;
using agenciaViajes.Application.Features.Configurations.Modules;
using agenciaViajes.Application.Infrastructure.Configurations;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using System.Linq;
using Microsoft.EntityFrameworkCore.Infrastructure;

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

// Aplicar migraciones automáticamente al iniciar (con logging detallado)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // List migrations available in the assembly
        var migrationsAssembly = services.GetService<IMigrationsAssembly>();
        if (migrationsAssembly == null)
        {
            // try to obtain it from the DbContext internal services (fallback)
            try
            {
                migrationsAssembly = context.GetService<IMigrationsAssembly>();
            }
            catch { /* ignore */ }
        }

        if (migrationsAssembly != null)
        {
            var all = migrationsAssembly.Migrations.Keys;
            Console.WriteLine("[MIGRATIONS] Migrations found in assembly: " + (all.Any() ? string.Join(", ", all) : "(none)"));
        }
        else
        {
            // final fallback: inspect application assembly for types deriving from Migration
            var appAssembly = typeof(AppDbContext).Assembly;
            var migrationTypes = appAssembly.GetTypes().Where(t => typeof(Migration).IsAssignableFrom(t)).Select(t => t.FullName);
            Console.WriteLine("[ASSEMBLY] Migration types found in App assembly: " + (migrationTypes.Any() ? string.Join(", ", migrationTypes) : "(none)"));
        }

        // Applied and pending migrations
        var appliedMigrations = await context.Database.GetAppliedMigrationsAsync();
        Console.WriteLine("[MIGRATIONS] Applied migrations: " + (appliedMigrations.Any() ? string.Join(", ", appliedMigrations) : "(none)"));

        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        Console.WriteLine("[MIGRATIONS] Pending migrations: " + (pendingMigrations.Any() ? string.Join(", ", pendingMigrations) : "(none)"));

        // Log model entity primary keys and any custom attributes on those PK properties
        var model = context.Model;
        foreach (var entityType in model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            var pk = entityType.FindPrimaryKey();
            var pkProps = pk?.Properties.Select(p => p.Name).ToArray() ?? Array.Empty<string>();
            var tableName = entityType.GetTableName() ?? entityType.Name;
            Console.WriteLine($"[MODEL] Entity: {clrType.FullName} -> Table: {tableName}, PK: {string.Join(", ", pkProps)}");

            if (clrType != null)
            {
                foreach (var propName in pkProps)
                {
                    var propInfo = clrType.GetProperty(propName);
                    if (propInfo != null)
                    {
                        var attrs = propInfo.GetCustomAttributes(false);
                        if (attrs != null && attrs.Length > 0)
                        {
                            Console.WriteLine($"[ATTR] {clrType.FullName}.{propName} attributes: {string.Join(", ", attrs.Select(a => a.GetType().FullName))}");
                        }
                        else
                        {
                            Console.WriteLine($"[ATTR] {clrType.FullName}.{propName} has no custom attributes.");
                        }
                    }
                }
            }
        }

        if (pendingMigrations.Any())
        {
            Console.WriteLine("[MIGRATIONS] Applying pending migrations...");
        }
        else
        {
            Console.WriteLine("[MIGRATIONS] No pending migrations to apply.");
        }

        await context.Database.MigrateAsync();
        Console.WriteLine("[OK] Migraciones aplicadas correctamente");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Error al aplicar migraciones: {ex}");
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

