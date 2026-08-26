# 📋 To-Do: Optimización y Mejoras de Código

> Análisis de performance y calidad de código para backend (`agenciaViajes.Application`) y frontend (`frontend/`).

---

## 🔧 Backend — `agenciaViajes.Application`

### ⚡ Performance

| # | Problema | Impacto | Solución | Prioridad |
|---|----------|---------|----------|-----------|
| 1 | **Sin caché de aplicación** | Dashboard ejecuta 4 queries pesadas en cada request sin cachear | Agregar `IMemoryCache` o `IDistributedCache` con TTL corto (30-60s) para endpoints de solo lectura (Dashboard, listas) | Alta |
| 2 | **N+1 en DashboardRepository** | Carga todos los `Sale` con `.Include(s => s.Payments)` y calcula rentabilidad en cliente con `foreach` | Mover el cálculo a SQL con `GROUP BY` + agregaciones, o usar `AsSplitQuery()` | Alta |
| 3 | **Sin paginación real** | Listados (`GetAllAsync`) traen **todos** los registros sin `Skip`/`Take` — el frontend ya tiene paginación visual pero el backend envía todo | Agregar `PageNumber`/`PageSize` a los Queries y aplicar `Skip`/`Take` | Alta |
| 4 | **Sin `AsNoTracking()`** | EF Core rastrea entidades en queries de solo lectura, sobrecargando el ChangeTracker | Agregar `.AsNoTracking()` en todos los queries GET | Alta |
| 5 | **Estado `static` mutable** | `ApiBaseRoutes.UnProtectedCache` usa `static int _callCount` y `static DateTime _lastCall` sin locks → race conditions | Eliminar estado mutable estático o usar `ConcurrentDictionary` + `Interlocked` | Media |
| 6 | **JWT handler recreado en cada request** | `TokenValidationMiddleware` crea un nuevo `JwtSecurityTokenHandler` y re-parsea la clave secreta por cada request | Cachear handler y clave como singleton | Media |
| 7 | **Transacciones innecesarias** | Verificar que ningún Query implemente `ITransactionalCommand` por error (solo Commands deben hacerlo) | Revisión de seguridad | Baja |

### 🧹 Calidad de Código

| # | Problema | Impacto | Solución | Prioridad |
|---|----------|---------|----------|-----------|
| 1 | **`ExceptionMiddleware` no logea errores** | Todos los `logger.LogError()` están comentados → errores silenciosos en producción | Descomentar los logs o implementar logging funcional | **Crítica** |
| 2 | **`UseSerilog()` comentado** | Serilog está configurado pero no integrado al host → `ILogger<T>` no usa Serilog | Activar `builder.Host.UseSerilog()` en `Program.cs` | Alta |
| 3 | **Middleware en capa incorrecta** | `ExceptionMiddleware` y `TokenValidationMiddleware` están en `Domain/` en vez de `Infrastructure/` | Mover a `Infrastructure/Middleware/` | Alta |
| 4 | **Sin pruebas** | Cero tests unitarios o de integración | Agregar proyecto xUnit + Testcontainers para PostgreSQL | Alta |
| 5 | **`Class1.cs` placeholder residual** | Archivo usado solo para assembly scanning | Renombrar a `AssemblyReference.cs` o eliminarlo | Baja |
| 6 | **Validación de dominio ausente** | FluentValidation valida en el Handler, pero no hay validación de negocio en las entidades mismas | Agregar métodos de dominio (ej. `Sale.CannotExceedBalance()`) | Media |
| 7 | **Refresh Token en JWT claim** | El refresh token se almacena como claim del access token, mezclando responsabilidades | Usar token independiente para refresh | Media |

---

## 🎨 Frontend — `frontend/`

### ⚡ Performance

| # | Problema | Impacto | Solución | Prioridad |
|---|----------|---------|----------|-----------|
| 1 | **Sin capa de caché de datos** | Cada navegación re-fetcha todos los datos desde cero; no hay deduplicación de requests | Migrar a **TanStack Query** — caché automática, stale-while-revalidate, deduplicación, refetch en background | **Crítica** |
| 2 | **Todas las páginas son `'use client'`** | No hay Server Components, SSG ni streaming. Todo el JS se envía a cada página | Mover partes estáticas (layout, breadcrumbs) a Server Components | Alta |
| 3 | **Header y Footer en cada page, no en layout** | Se re-montan en cada navegación perdiendo estado interno | Mover `Header` y `Footer` al `app/layout.tsx` como `{children}` | Alta |
| 4 | **Sin memoización de componentes pesados** | `DashboardCharts` reprocesa datasets en cada render | Agregar `React.memo` y `useMemo` en transformaciones de datos de Chart.js | Media |
| 5 | **Sin virtualización en tablas** | Renderizan todas las filas aunque haya miles | Usar `react-window` o MUI Grid virtualizado | Media |
| 6 | **Sin bundle analyzer** | No se sabe qué pesa en el bundle (html2pdf.js ~200KB, MUI completo, PrimeReact, Chart.js) | Agregar `@next/bundle-analyzer` y considerar lazy loading | Media |
| 7 | **`useDashboard` sin granularidad** | 4 endpoints en `Promise.all` con un solo loading/error — si uno falla, todos fallan | Separar estados por endpoint | Baja |
| 8 | **next-auth instalado sin uso** | 8.5KB gzipped en producción sin ser utilizado | Remover dependencia | Baja |

### 🧹 Calidad de Código

| # | Problema | Impacto | Solución | Prioridad |
|---|----------|---------|----------|-----------|
| 1 | **`err: any` en todos los catches** | Viola la convention del proyecto que pide `unknown` + type guard | Reemplazar por `catch (err: unknown)` con `err instanceof Error` | Alta |
| 2 | **Side effect dentro de `useMemo`** | `clientes/page.tsx` tiene `setPage(0)` dentro de `useMemo` — patrón peligroso | Mover `setPage(0)` a `useEffect` (como ya hace `proveedores/page.tsx`) | Alta |
| 3 | **`DashboardApiResponse` duplicado** | Interfaz idéntica a `ApiResponse<T>` de `@/types/api` definida localmente | Importar y reusar `ApiResponse<T>` | Media |
| 4 | **`Payment` duplicado en `sale.ts` y `payment.ts`** | Dos definiciones del mismo tipo que pueden desincronizarse | Unificar en `payment.ts` e importar donde se necesite | Media |
| 5 | **`Button.tsx` no usa MUI Button** | Implementación custom con borderRadius 8px vs 12px del theme | Usar MUI Button con `sx` overrides o alinear borderRadius | Media |
| 6 | **`useCallback` con deps vacías** | Varios hooks tienen `useCallback(fn, [])` con funciones del closure que podrían quedar stale | Migrar a TanStack Query (elimina esta complejidad) o agregar deps correctas | Media |
| 7 | **Sin barrel exports** | Cada import apunta a ruta exacta en vez de imports limpios | Agregar `index.ts` en carpetas principales | Baja |
| 8 | **Cero tests** | Sin Jest, Vitest, ni Playwright | Agregar Vitest + React Testing Library | Alta |
| 9 | **`useAlert` con SweetAlert2 imperativo** | Mezcla paradigma declarativo (React) con imperativo | Considerar MUI Snackbar/Alert como alternativa | Baja |
| 10 | **Tipado débil en PrimeReact `pt`** | Parámetro `opts` en callbacks de Calendar tipado como `any` | Definir interfaz para el contexto o castear correctamente | Baja |

---

## 🏆 Prioridades Recomendadas

### Sprint 1 — Crítico
1. Backend: Activar Serilog + descomentar logs en ExceptionMiddleware
2. Frontend: Migrar a TanStack Query (reemplaza hooks manuales, elimina stale closures, caché automática)
3. Frontend: Mover Header/Footer al root layout

### Sprint 2 — Alta
4. Backend: `AsNoTracking()` en todos los querys GET
5. Backend: Paginación real (Skip/Take)
6. Frontend: Reemplazar `err: any` por `err: unknown`
7. Frontend: Eliminar side effect en `useMemo` de clientes
8. Frontend: Remover `next-auth` y `DashboardApiResponse` duplicado

### Sprint 3 — Media
9. Backend: Cachear Dashboard queries con IMemoryCache
10. Backend: Mover middleware a Infrastructure/
11. Backend: Optimizar N+1 en DashboardRepository
12. Frontend: Agregar virtualización en tablas
13. Frontend: Unificar tipo `Payment`
14. Frontend: Agregar bundle analyzer + lazy loading

### Sprint 4 — Mejora continua
15. Backend: Agregar proyecto de tests
16. Frontend: Agregar Vitest + React Testing Library
17. Backend: Cachear JWT handler como singleton
18. Frontend: Barrel exports, tipado débil, alinear borderRadius
