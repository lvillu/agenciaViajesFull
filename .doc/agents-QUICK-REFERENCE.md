# ⚡ FlowBit Agents - Quick Reference

Guía de referencia rápida para usar los agentes de FlowBit de forma eficiente.

---

## 🚀 Inicio Rápido

### Backend (.NET)
```bash
@flowbit-backend [tu petición]
```

### Frontend (Next.js/React)
```bash
@flowbit-frontend [tu petición]
```

---

## 📋 Comandos Más Comunes

### Backend Commands

| Qué necesitas | Comando |
|---------------|---------|
| Crear Command | `@flowbit-backend crea {Name}Command para {acción}` |
| Crear Query | `@flowbit-backend crea {Name}Query para {consulta}` |
| Crear Entidad | `@flowbit-backend crea entidad {Name} con campos: [lista]` |
| Crear Repositorio | `@flowbit-backend crea I{Name}Repository con métodos CRUD` |
| Agregar Validación | `@flowbit-backend agrega validaciones a {Name}Validator: [lista]` |
| Refactorizar Handler | `@flowbit-backend refactoriza {Name}Handler para [mejora]` |

### Frontend Commands

| Qué necesitas | Comando |
|---------------|---------|
| Crear Componente UI | `@flowbit-frontend crea componente {Name} en ui/` |
| Crear Componente Shared | `@flowbit-frontend crea {Name} component en shared/` |
| Crear Hook | `@flowbit-frontend crea use{Name} hook para [propósito]` |
| Crear Service | `@flowbit-frontend crea {name}Service con métodos: [lista]` |
| Crear Store | `@flowbit-frontend crea {name}Store en Zustand con: [props]` |
| Crear Página | `@flowbit-frontend crea página /dashboard/{ruta}` |
| Crear Tipos | `@flowbit-frontend crea types para {Entity} con campos: [lista]` |

---

## 🎯 Plantillas de Peticiones

### Backend: Nueva Feature Completa

```
@flowbit-backend crea una feature {FeatureName} para {descripción}:

Entidad: {EntityName}
Campos:
- {campo1} ({tipo}, validaciones)
- {campo2} ({tipo}, validaciones)

Command/Query: {Tipo}
Request:
- {campo1}
- {campo2}

Response:
- {campo1}
- {campo2}

Validaciones:
- {validación 1}
- {validación 2}

Lógica especial:
- {lógica 1}
```

### Frontend: Componente Completo

```
@flowbit-frontend crea componente {ComponentName} que:

Props:
- {prop1}: {tipo} - {descripción}
- {prop2}: {tipo} - {descripción}

Funcionalidad:
- {funcionalidad 1}
- {funcionalidad 2}

Estado:
- {estado 1}
- {estado 2}

Validaciones (si aplica):
- {validación 1}
```

### Frontend: Hook con Service

```
@flowbit-frontend crea use{Name} hook que:

Service: {serviceName}
Estado:
- {state1}: {tipo}
- {state2}: {tipo}

Funciones:
- {func1}(): {descripción}
- {func2}({params}): {descripción}

Efectos:
- Cargar datos al montar
- {efecto especial}
```

---

## 🔑 Palabras Clave Importantes

### Backend

**Para Commands (modifican estado):**
- `CreateCommand`, `UpdateCommand`, `DeleteCommand`
- `ProcessCommand`, `ExecuteCommand`, `CompleteCommand`
- Usa `ITransactionalCommand` si necesita transacción

**Para Queries (solo lectura):**
- `GetQuery`, `GetListQuery`, `SearchQuery`
- `FindQuery`, `GetByQuery`
- No modifica estado

**Validaciones:**
- `NotEmpty()`, `NotNull()`, `MaximumLength()`, `MinimumLength()`
- `GreaterThan()`, `LessThan()`, `EmailAddress()`
- `Must()` para validaciones custom

---

### Frontend

**Componentes:**
- `'use client'` para componentes interactivos
- `React.FC<Props>` para tipado
- Props interface con TypeScript

**Hooks:**
- Prefijo `use` SIEMPRE
- Retornar objeto `{ state, actions }`
- `useEffect` para side effects
- `useState` para estado local

**Services:**
- Métodos async con try/catch
- Retornar tipos específicos (no `any`)
- Usar `apiClient` para HTTP

**Stores (Zustand):**
- `create<State>()()` para tipado
- `persist` middleware para localStorage
- Acciones dentro del store

---

## 🏗️ Estructura de Archivos

### Backend: Feature Completa

```
Features/{Module}/{FeatureName}/
├── {FeatureName}Command.cs       # IRequest<Result<T>>
├── {FeatureName}Handler.cs       # IRequestHandler<>
├── {FeatureName}Validator.cs     # AbstractValidator<>
└── Common/
    ├── Requests/
    │   └── {FeatureName}Request.cs
    └── Responses/
        └── {Entity}Response.cs
```

### Frontend: Módulo Completo

```
src/
├── components/{module}/
│   ├── {Component}List.tsx
│   ├── {Component}Form.tsx
│   └── {Component}Card.tsx
├── hooks/
│   └── use{Module}.ts
├── services/
│   └── {module}Service.ts
├── store/
│   └── {module}Store.ts
└── types/
    └── {module}.d.ts
```

---

## ✅ Checklist: Antes de Enviar

### Backend
- [ ] ¿Es Command o Query?
- [ ] ¿Qué entidad/módulo?
- [ ] ¿Qué campos/props?
- [ ] ¿Qué validaciones?
- [ ] ¿Qué repositorio necesito?
- [ ] ¿Es transaccional?

### Frontend
- [ ] ¿Componente, Hook, Service o Store?
- [ ] ¿En qué carpeta va?
- [ ] ¿Qué props/params acepta?
- [ ] ¿Qué retorna?
- [ ] ¿Necesita tipado TypeScript?
- [ ] ¿Es interactivo? (`'use client'`)

---

## 🎨 Convenciones de Naming

### Backend

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Command | `{Verb}{Entity}Command` | `CreateProductCommand` |
| Query | `Get{Entity}Query` | `GetProductQuery` |
| Handler | `{Feature}Handler` | `CreateProductHandler` |
| Validator | `{Feature}Validator` | `CreateProductValidator` |
| Request | `{Feature}Request` | `CreateProductRequest` |
| Response | `{Entity}Response` | `ProductResponse` |
| Repository | `I{Entity}Repository` | `IProductRepository` |
| Entity | `{Entity}` | `Product` |

### Frontend

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente UI | `{Name}` | `Button`, `Input` |
| Componente Shared | `{Name}` | `DataTable`, `Navbar` |
| Hook | `use{Name}` | `useProducts`, `useAuth` |
| Service | `{name}Service` | `productsService` |
| Store | `use{Name}Store` | `useAuthStore` |
| Type | `{Entity}` | `Product`, `User` |
| Props Interface | `{Component}Props` | `ButtonProps` |

---

## 🚫 Errores Comunes

### Backend

| ❌ Error | ✅ Correcto |
|----------|-------------|
| Lógica en Controller | Lógica en Handler |
| DbContext directo | Usar Repository |
| `var` sin tipo claro | Tipo explícito |
| Excepción para flujo | `Result<T>.Failure()` |
| Entidad en Response | DTO Response |

### Frontend

| ❌ Error | ✅ Correcto |
|----------|-------------|
| `any` en TypeScript | Tipo específico |
| Fetch directo | Usar Service |
| Componente > 200 líneas | Dividir en componentes |
| Lógica en componente | Extraer a Hook |
| Olvidar `'use client'` | Agregar en componentes interactivos |

---

## 🔧 Debugging: El Agente No Entiende

### 1. Divide la tarea

En vez de:
```
@flowbit-backend crea un CRUD completo de usuarios
```

Haz:
```
@flowbit-backend crea CreateUserCommand
@flowbit-backend crea GetUserQuery
@flowbit-backend crea UpdateUserCommand
@flowbit-backend crea DeleteUserCommand
```

### 2. Proporciona más contexto

```
@flowbit-backend crea CreateOrderCommand que:
- Acepte userId, productIds[], quantities[]
- Valide que el usuario exista
- Valide que todos los productos existan
- Valide que haya stock suficiente
- Calcule el total
- Cree la orden con sus items
- Actualice el stock
- Todo en transacción
```

### 3. Muestra un ejemplo

```
@flowbit-frontend crea un hook similar a useProducts, pero para categorías.

useProducts hace:
- Estado: categories, loading, error
- Funciones: fetchAll(), create(), update(), delete()
- Usa categoriesService
```

---

## 📊 Métricas de Calidad

### Backend
- ✅ Cada Feature tiene su propia carpeta
- ✅ Command/Query ≤ 10 líneas
- ✅ Handler tiene una sola responsabilidad
- ✅ Validator tiene reglas claras
- ✅ Request/Response son DTOs (no entidades)
- ✅ Usa async/await
- ✅ Retorna `Result<T>`

### Frontend
- ✅ Componente ≤ 200 líneas
- ✅ Props tipadas con TypeScript
- ✅ Lógica compleja en Hooks
- ✅ Llamadas HTTP en Services
- ✅ Estado global en Stores
- ✅ `'use client'` cuando es interactivo
- ✅ No hay `any` en el código

---

## 🎓 Principios SOLID Aplicados

### Backend

| Principio | Cómo se aplica |
|-----------|----------------|
| **S**ingle Responsibility | Un Handler, una función |
| **O**pen/Closed | Extender con nuevos Handlers, no modificar existentes |
| **L**iskov Substitution | Interfaces consistentes |
| **I**nterface Segregation | Repositorios específicos |
| **D**ependency Inversion | Inyectar interfaces, no implementaciones |

### Frontend

| Principio | Cómo se aplica |
|-----------|----------------|
| **S**ingle Responsibility | Un componente, una función visual |
| **O**pen/Closed | Props para extender comportamiento |
| **L**iskov Substitution | Props consistentes entre componentes similares |
| **I**nterface Segregation | Props específicas, no "god objects" |
| **D**ependency Inversion | Services abstractos, no implementaciones directas |

---

## 🌐 KrakenD API Gateway - TRÈS IMPORTANTE

**Todas las nuevas rutas DEBEN ser registradas en KrakenD** (`deploy/KrakenD/krakend.json`)

### Checklist al crear una nueva ruta:

1. ✅ **Crear la Feature en el backend**
   - Command/Query, Handler, Validator, DTOs

2. ✅ **Crear/Actualizar archivo de rutas**
   - Archivo: `Features/Configurations/Routes/{Module}Routes.cs`
   - Usar `MapGroup(BASE_URL)` para agrupar rutas
   - Aplicar `.RequireAuthorization()` si es protegida

3. ✅ **Registrar en ModulesConfiguration.cs**
   - Agregar `app.Add{Module}Routes();`
   - NO crear rutas directamente en Program.cs

4. ⭐ **AGREGAR endpoint en KrakenD** (OBLIGATORIO)
   - Abrir `deploy/KrakenD/krakend.json`
   - Agregar nuevo endpoint en la sección `endpoints`

### Ejemplo de archivo de rutas ({Module}Routes.cs):

```csharp
public static class ProviderRoutes
{
    public const string ROUTE_TAGS = "Provider";
    public const string BASE_URL = "/api/Provider";

    public static void AddProviderRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BASE_URL)
            .WithTags(ROUTE_TAGS)
            .RequireAuthorization();  // ⭐ Proteger todas las rutas del grupo

        group.MapGet("/", GetProvidersList);
        group.MapGet("/{id:int}", GetProviderById);
        group.MapPost("/", CreateProvider);
    }
}

// Luego en ModulesConfiguration.cs:
app.AddProviderRoutes();  // ⭐ Registro centralizado
```

### Ejemplo de endpoint en KrakenD:

```json
{
  "endpoint": "/signup",
  "method": "POST",
  "input_headers": ["*"],
  "backend": [
    {
      "url_pattern": "/api/auth/signup"
    }
  ]
}
```

### Patrones comunes:

| Ruta Local | Endpoint KrakenD | Patrón URL |
|-----------|------------------|-----------|
| `/api/Auth/login` | `/login` | `/api/auth/login` |
| `/api/Auth/logout` | `/logout` | `/api/auth/logout` |
| `/api/Auth/signup` | `/signup` | `/api/auth/signup` |
| `/api/Products/list` | `/products` | `/api/products/list` |

⚠️ **Recuerda:** Sin registrar en KrakenD, la ruta será inaccesible desde el gateway (puerto 5050).

---

## 📞 Ayuda Rápida

### ¿El código no compila?
1. Revisa los imports/usings
2. Verifica que las dependencias existan
3. Valida los tipos
4. Pide al agente que corrija el error específico

### ¿El agente genera código incorrecto?
1. Sé más específico en tu petición
2. Proporciona un ejemplo de lo que quieres
3. Divide la tarea en pasos más pequeños
4. Revisa que estás usando el agente correcto (backend vs frontend)

### ¿Quiero personalizar los agentes?
Edita los archivos:
- `../.copilot/agents/flowbit-backend-agent.yaml`
- `../.copilot/agents/flowbit-frontend-agent.yaml`

---

## 🔗 Enlaces Rápidos

- **Documentación completa:** [agents-README.md](./agents-README.md)
- **Ejemplos prácticos:** [agents-EXAMPLES.md](./agents-EXAMPLES.md)
- **Arquitectura del proyecto:** `./project_overview.md`
- **Guía rápida del proyecto:** `./README.md`

---

**Última actualización:** 7 de Febrero, 2026  
**Versión:** 1.0  
**Mantén esta guía a mano para referencia rápida! 🚀**
