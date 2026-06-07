# Backend Conventions — Vertical Slice + CQRS

## Proyecto

- **Namespace base:** `agenciaViajes.Application`
- **Framework:** .NET 8 / PostgreSQL / EF Core (Npgsql) / MediatR / FluentValidation

---

## Ubicaciones clave

| Qué | Ruta |
|-----|------|
| Features | `backend/agenciaViajes.Application/Features/` |
| Entidades | `backend/agenciaViajes.Application/Domain/Entities/` |
| Repositorios (interfaces) | `backend/agenciaViajes.Application/Domain/Repositories/` |
| Repositorios (implementación) | `backend/agenciaViajes.Application/Infrastructure/Persistance/` |
| Shared (Result, etc.) | `backend/agenciaViajes.Application/Domain/Shared/` |
| Rutas centralizadas | `backend/agenciaViajes.Application/Features/Configurations/Routes/` |
| Registro de rutas | `backend/agenciaViajes.Application/Features/Configurations/Modules/ModulesConfiguration.cs` |
| KrakenD | `deploy/KrakenD/krakend.prod.tmpl` |

---

## Estructura de un Feature slice

```
Features/{Module}/{FeatureName}/
├── {FeatureName}Command.cs   (o Query.cs)
├── {FeatureName}Handler.cs
├── {FeatureName}Validator.cs
└── Common/
    ├── Requests/
    │   └── {FeatureName}Request.cs
    └── Responses/
        └── {Module}Response.cs
```

---

## Naming conventions

| Artefacto | Patrón | Ejemplo |
|-----------|--------|---------|
| Command | `{Verb}{Entity}Command` | `CreateSaleCommand` |
| Query | `Get{Entity}Query` / `Get{Entity}ListQuery` | `GetSaleByIdQuery` |
| Handler | `{FeatureName}Handler` | `CreateSaleHandler` |
| Validator | `{FeatureName}Validator` | `CreateSaleValidator` |
| Request DTO | `{FeatureName}Request` | `CreateSaleRequest` |
| Response DTO | `{Entity}Response` | `SaleResponse` |
| Route class | `{Module}Routes` | `SaleRoutes` |
| Route method | `Add{Module}Routes` | `AddSaleRoutes` |

---

## Templates

### Command

```csharp
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.{Module}.Common.Requests;
using agenciaViajes.Application.Features.{Module}.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.{Module}.{FeatureName};

public sealed record {FeatureName}Command(
    {FeatureName}Request Request
) : IRequest<Result<{Entity}Response>>, ITransactionalCommand;
```

> Usar `ITransactionalCommand` solo en Commands que modifican estado (Create, Update, Delete).

---

### Query

```csharp
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.{Module}.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.{Module}.{FeatureName};

public sealed record {FeatureName}Query(int Id) : IRequest<Result<{Entity}Response>>;
```

---

### Handler

```csharp
using agenciaViajes.Application.Domain.Repositories;
using agenciaViajes.Application.Domain.Shared;
using agenciaViajes.Application.Features.{Module}.Common.Responses;
using MediatR;

namespace agenciaViajes.Application.Features.{Module}.{FeatureName};

public class {FeatureName}Handler : IRequestHandler<{FeatureName}Command, Result<{Entity}Response>>
{
    private readonly I{Entity}Repository _repository;

    public {FeatureName}Handler(I{Entity}Repository repository)
    {
        _repository = repository;
    }

    public async Task<Result<{Entity}Response>> Handle(
        {FeatureName}Command request,
        CancellationToken cancellationToken)
    {
        // 1. Validación de negocio
        // 2. Mapeo request → entidad
        // 3. Llamada al repositorio (NO usar ISender aquí)
        // 4. Mapeo entidad → response
        // 5. Retornar Result.Success / Result.Failure

        return Result<{Entity}Response>.Success(response);
    }
}
```

> **IMPORTANTE:** El Handler inyecta repositorios directamente. **Nunca** usar `ISender` dentro de un Handler para llamar a otro Handler.

---

### Validator

```csharp
using agenciaViajes.Application.Features.{Module}.Common.Requests;
using FluentValidation;

namespace agenciaViajes.Application.Features.{Module}.{FeatureName};

public class {FeatureName}Validator : AbstractValidator<{FeatureName}Request>
{
    public {FeatureName}Validator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Requerido")
            .MaximumLength(200).WithMessage("Máximo 200 caracteres");
    }
}
```

---

### Request DTO

```csharp
namespace agenciaViajes.Application.Features.{Module}.Common.Requests;

public class {FeatureName}Request
{
    public string Name { get; set; }
}
```

---

### Response DTO

```csharp
namespace agenciaViajes.Application.Features.{Module}.Common.Responses;

public class {Entity}Response
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

### Routes file

```csharp
using agenciaViajes.Application.Features.{Module}.{FeatureName};
using MediatR;

namespace agenciaViajes.Application.Features.Configurations.Routes;

public static class {Module}Routes
{
    public const string ROUTE_TAGS = "{Module}";
    public const string BASE_URL = "/api/{module}";   // kebab-case

    public static void Add{Module}Routes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BASE_URL)
            .WithTags(ROUTE_TAGS)
            .RequireAuthorization();

        group.MapGet("/", Get{Module}List);
        group.MapGet("/{id:int}", Get{Module}ById);
        group.MapPost("/", Create{Module});
        group.MapPut("/{id:int}", Update{Module});
        group.MapDelete("/{id:int}", Delete{Module});
    }

    private static async Task<IResult> Get{Module}List(
        ISender sender, CancellationToken ct)
    {
        var response = await sender.Send(new Get{Module}ListQuery(), ct);
        return response.IsSuccess ? Results.Ok(response) : Results.BadRequest(response);
    }
    // ... resto de métodos privados
}
```

> Siempre retornar el objeto `Result<T>` completo. **Nunca** retornar solo `.Data`.

---

### Registro en ModulesConfiguration.cs

```csharp
public static void Configure(WebApplication app)
{
    app.AddAuthRoutes();
    app.AddUserRoutes();
    app.Add{Module}Routes();   // ← agregar aquí
}
```

---

### Bloque KrakenD

```json
{
  "endpoint": "/{module}/{id}",
  "method": "GET",
  "output_encoding": "no-op",
  "input_headers": ["Authorization", "Content-Type"],
  "backend": [
    {
      "url_pattern": "/api/{module}/{id}",
      "host": ["http://api:8080"],
      "method": "GET"
    }
  ]
}
```

- Agregar `"input_query_strings": ["param"]` si el endpoint acepta query strings.
- Agregar `"encoding": "no-op"` en el backend si el endpoint recibe body (POST/PUT).

---

## Reglas críticas

- MediatR fluye **API → Handler** únicamente. Nunca Handler → Handler.
- Todo acceso a BD: `async/await` + `CancellationToken`.
- Endpoints **nunca** en `Program.cs`. Siempre en `Routes/{Module}Routes.cs`.
- PostgreSQL: tablas y columnas en `snake_case`.
- Campos de auditoría estándar: `created_at`, `modified_at`.
