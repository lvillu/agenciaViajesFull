using Serilog;

namespace agenciaViajes.Application.Features.Configurations
{
    public static class Logging
    {
        public static void AddLogging()
        {
            // LOG_PATH configurable: en docker es ruta Linux (ver Dockerfile),
            // en local cae a logs/ del working directory. Consola siempre
            // para que `docker logs` muestre todo.
            var logPath = Environment.GetEnvironmentVariable("LOG_PATH") ?? "logs/log-.txt";
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .WriteTo.Console()
                .WriteTo.File(logPath, rollingInterval: RollingInterval.Day)
                .CreateLogger();
        }
    }
}
