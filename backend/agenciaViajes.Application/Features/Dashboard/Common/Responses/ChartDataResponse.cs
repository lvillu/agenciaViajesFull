namespace agenciaViajes.Application.Features.Dashboard.Common.Responses
{
    /// <summary>
    /// Respuesta en formato compatible con Chart.js / PrimeReact Charts
    /// </summary>
    public class ChartDataResponse
    {
        public List<string> Labels { get; set; } = new();
        public List<ChartDataset> Datasets { get; set; } = new();
    }

    public class ChartDataset
    {
        public string? Label { get; set; }
        public List<decimal> Data { get; set; } = new();
        public List<string>? BackgroundColor { get; set; }
        public List<string>? BorderColor { get; set; }
        public int? BorderWidth { get; set; }
    }
}
