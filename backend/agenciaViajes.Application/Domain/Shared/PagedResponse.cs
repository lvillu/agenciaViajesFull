namespace agenciaViajes.Application.Domain.Shared
{
    /// <summary>
    /// Envelope paginado para listados. Todos los listados aceptan
    /// page (1-based) y pageSize (1..100) para no cargar tablas completas.
    /// </summary>
    public class PagedResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(Total / (double)PageSize);
    }

    public static class Paging
    {
        public const int DefaultPage = 1;
        public const int DefaultPageSize = 20;
        public const int MaxPageSize = 100;

        public static (int Page, int PageSize) Normalize(int page, int pageSize)
        {
            page = page < 1 ? DefaultPage : page;
            pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);
            return (page, pageSize);
        }
    }
}
