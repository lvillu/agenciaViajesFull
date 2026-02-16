using Serilog;

namespace agenciaViajes.Application.Features.Configurations
{
    public static class Logging
    {
        public static void AddLogging()
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.File(@"C:/logs/log-.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();
        }
    }
}
