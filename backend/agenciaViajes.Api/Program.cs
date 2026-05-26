using agenciaViajes.Application.Domain.Middleware;
using agenciaViajes.Application.Features.Configurations;
using agenciaViajes.Application.Features.Configurations.Modules;
using agenciaViajes.Application.Infrastructure.Configurations;
using agenciaViajes.Application.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using System.Linq;
using System.Reflection;

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
                // Obtener IMigrationsAssembly desde el propio DbContext (no del contenedor raíz)
                try
                {
                    var migrationsAssembly = context.GetService<IMigrationsAssembly>();
                    if (migrationsAssembly != null)
                    {
                        Console.WriteLine("[DIAG] MigrationsAssembly: " + migrationsAssembly.Assembly.FullName);
                        Console.WriteLine("[DIAG] Migrations keys: " + string.Join(", ", migrationsAssembly.Migrations.Keys));

                        var allTypes = migrationsAssembly.Assembly.GetTypes().OrderBy(t => t.FullName).ToArray();
                        var migrationTypes = allTypes.Where(t => typeof(Migration).IsAssignableFrom(t)).ToArray();
                        Console.WriteLine("[DIAG] Migration types en ensamblado: " + string.Join(", ", migrationTypes.Select(t => t.FullName)));

                        // Inspeccionar cada tipo para encontrar MigrationAttribute y su Id
                        foreach (var t in migrationTypes)
                        {
                            try
                            {
                                var isPublic = t.IsPublic;
                                var isAbstract = t.IsAbstract;
                                var hasMigrationAttr = t.GetCustomAttributes(false).OfType<MigrationAttribute>().FirstOrDefault();
                                var attrId = hasMigrationAttr?.Id ?? "<none>";
                                Console.WriteLine($"[DIAG-T] Type: {t.FullName} | AttrId: {attrId} | Public: {isPublic} | Abstract: {isAbstract}");

                                // Mostrar CustomAttributeData para diagnosticar metadatos en el ensamblado
                                var cad = t.GetCustomAttributesData().ToArray();
                                if (cad.Length == 0)
                                {
                                    Console.WriteLine($"[DIAG-CA] Type: {t.FullName} no tiene CustomAttributeData");
                                }
                                else
                                {
                                    foreach (var ca in cad)
                                    {
                                        var args = ca.ConstructorArguments.Select(a => a.Value == null ? "<null>" : a.Value.ToString());
                                        Console.WriteLine($"[DIAG-CA] Type: {t.FullName} | AttrType: {ca.AttributeType.FullName} | CtorArgs: {string.Join(", ", args)}");
                                    }
                                }
                            }
                            catch (Exception te)
                            {
                                Console.WriteLine($"[DIAG-T] Error inspeccionando tipo {t.FullName}: {te.Message}");
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine("[DIAG] IMigrationsAssembly no disponible vía context.GetService<IMigrationsAssembly>()");
                    }
                }
                catch (Exception innerEx)
                {
                    Console.WriteLine($"[DIAG] Error al inspeccionar IMigrationsAssembly desde DbContext: {innerEx.Message}");
                }

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

