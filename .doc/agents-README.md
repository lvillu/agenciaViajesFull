# 🤖 FlowBit Custom Agents

Esta carpeta contiene agentes personalizados de GitHub Copilot para el proyecto FlowBit. Estos agentes están especializados en seguir las arquitecturas y patrones específicos del proyecto.

---

## 📋 Agentes Disponibles

### 1. 🔷 **flowbit-backend** - Agente Backend .NET

**Especialidad:** Desarrollo backend con .NET 8, Vertical Slice Architecture, CQRS + MediatR, y principios SOLID.

**Cuándo usarlo:**
- ✅ Crear nuevas Features (Commands/Queries)
- ✅ Implementar Handlers y Validators
- ✅ Crear o modificar DTOs (Requests/Responses)
- ✅ Implementar Repositories
- ✅ Cualquier tarea de backend que deba seguir la arquitectura establecida

**Ejemplo de uso:**
```
@flowbit-backend crea una feature para actualizar un producto
@flowbit-backend necesito implementar un query para listar productos con paginación
@flowbit-backend ayúdame a crear un command para eliminar una categoría
```

**Conocimientos especializados:**
- Arquitectura Vertical Slice
- CQRS con MediatR
- Repository Pattern
- FluentValidation
- Principios SOLID
- Entity Framework
- Result Pattern

---

### 2. 🔶 **flowbit-frontend** - Agente Frontend Next.js/React

**Especialidad:** Desarrollo frontend con Next.js 15, React 19, TypeScript, Zustand, y Material UI.

**Cuándo usarlo:**
- ✅ Crear componentes reutilizables (UI o Shared)
- ✅ Implementar custom hooks
- ✅ Crear services para consumir APIs
- ✅ Configurar stores de Zustand
- ✅ Crear páginas con App Router
- ✅ Cualquier tarea de frontend que deba seguir las convenciones

**Ejemplo de uso:**
```
@flowbit-frontend crea un componente DataTable genérico
@flowbit-frontend necesito un hook useProductos para gestionar productos
@flowbit-frontend ayúdame a crear un servicio para categorías
@flowbit-frontend crea una página de dashboard con gráficos
```

**Conocimientos especializados:**
- Next.js 15 (App Router)
- React 19 (componentes funcionales)
- TypeScript avanzado
- Zustand para estado global
- Custom Hooks
- Services con Axios
- Material UI 6
- React Hook Form + Zod

---

## 🚀 Cómo Usar los Agentes

### Opción 1: Mencionar directamente en el chat

```
@flowbit-backend crear feature CreateOrder
```

### Opción 2: Usar con comandos específicos

```
@flowbit-frontend implementar componente de tabla de productos
```

### Opción 3: Combinar agentes (para tareas full-stack)

```
Primero: @flowbit-backend crea la API para productos
Luego: @flowbit-frontend crea la interfaz para consumir esa API
```

---

## ⚠️ IMPORTANTE: KrakenD API Gateway

**Toda nueva ruta en el backend DEBE registrarse en KrakenD** (`deploy/KrakenD/krakend.json`).

Sin esto, la ruta será inaccesible desde el API Gateway (puerto 5050).

### Checklist al crear una Feature:
1. ✅ Crear Command/Query, Handler, Validator, DTOs
2. ✅ Registrar en AuthRoutes o ModuleRoutes
3. ⭐ **REGISTRAR EN KRAKEND** (mismo día)
4. ✅ Reconstruir Docker: `docker-compose up -d --build`
5. ✅ Verificar que funciona desde puerto 5050

**📖 Documentación completa:** [`KRAKEND-INTEGRATION.md`](./KRAKEND-INTEGRATION.md)

---

## 📐 Arquitectura y Convenciones

### Backend (.NET 8)
Los agentes están entrenados para seguir:

**Estructura de Features (Vertical Slice):**
```
Features/{Module}/{FeatureName}/
├── {FeatureName}Command.cs o Query.cs
├── {FeatureName}Handler.cs
├── {FeatureName}Validator.cs
└── Common/
    ├── Requests/
    └── Responses/
```

**Principios SOLID:**
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

**Patrones:**
- CQRS (Command Query Responsibility Segregation)
- Repository Pattern
- Dependency Injection
- Result Pattern

---

### Frontend (Next.js 15 + React 19)
Los agentes están entrenados para seguir:

**Estructura de Carpetas:**
```
src/
├── app/              # Rutas (App Router)
├── components/
│   ├── shared/       # Componentes globales
│   └── ui/           # Primitivos de UI
├── hooks/            # Custom hooks
├── services/         # HTTP services
├── store/            # Zustand stores
└── types/            # TypeScript types
```

**Convenciones:**
- Componentes funcionales con TypeScript
- Custom hooks con prefijo `use`
- Services centralizados con `apiClient`
- Estado global con Zustand
- Formularios con React Hook Form + Zod

---

## 💡 Mejores Prácticas

### 1. **Sé específico en tus peticiones**

❌ Malo:
```
@flowbit-backend crea algo para productos
```

✅ Bueno:
```
@flowbit-backend crea un Command para actualizar el precio de un producto, 
incluyendo validación que el precio sea mayor a 0
```

---

### 2. **Usa el agente correcto para cada tarea**

- Backend: Lógica de negocio, APIs, base de datos
- Frontend: Componentes, hooks, UI, consumo de APIs

---

### 3. **Proporciona contexto cuando sea necesario**

```
@flowbit-backend crea un Query para buscar productos por categoría.
El filtro debe aceptar categoryId como parámetro y retornar una lista paginada.
```

---

### 4. **Revisa la salida del agente**

Los agentes están entrenados para seguir las mejores prácticas, pero siempre:
- ✅ Verifica que el código cumple con tus requisitos
- ✅ Revisa que las dependencias existan
- ✅ Valida que los tipos TypeScript sean correctos
- ✅ Prueba el código antes de hacer commit

---

## 🔍 Ejemplos de Casos de Uso

### Caso 1: Nueva Feature Completa

**Backend:**
```
@flowbit-backend crea una feature completa para gestionar órdenes de compra:
- CreateOrderCommand con validación
- GetOrderQuery por ID
- GetOrdersQuery con paginación
- OrderResponse con todos los campos
```

**Frontend:**
```
@flowbit-frontend crea la interfaz para órdenes:
- Componente OrderList con DataTable
- Hook useOrders para gestionar órdenes
- Service ordersService con CRUD completo
- Página de órdenes en /dashboard/ordenes
```

---

### Caso 2: Refactorización

**Backend:**
```
@flowbit-backend refactoriza el ProductHandler para usar AutoMapper 
en lugar de mapeo manual
```

**Frontend:**
```
@flowbit-frontend refactoriza el componente ProductForm para usar 
React Hook Form con validación Zod
```

---

### Caso 3: Agregar Validaciones

**Backend:**
```
@flowbit-backend agrega validaciones al CreateProductValidator:
- Descripción entre 5 y 200 caracteres
- Precio entre 0.01 y 999,999.99
- Cantidad mínima de 1
```

**Frontend:**
```
@flowbit-frontend agrega validación en tiempo real al formulario de productos
usando Zod schema
```

---

## 📚 Referencias

### Documentación del Proyecto
- **Arquitectura completa:** `/.doc/project_overview.md`
- **Guía rápida:** `/.doc/README.md`

### Ubicaciones Clave

**Backend:**
- Features: `src/FlowBitBase.Application/Features/`
- Entities: `src/FlowBitBase.Application/Domain/Entities/`
- Repositories: `src/FlowBitBase.Application/Domain/Repositories/`

**Frontend:**
- Componentes: `front/flowbitbasefront/src/components/`
- Hooks: `front/flowbitbasefront/src/hooks/`
- Services: `front/flowbitbasefront/src/services/`
- Pages: `front/flowbitbasefront/src/app/`

---

## 🛠️ Solución de Problemas

### El agente no entiende mi petición

1. Sé más específico
2. Proporciona ejemplos o contexto
3. Divide la tarea en pasos más pequeños

### El código generado no compila

1. Verifica que las dependencias existan
2. Revisa los imports/usings
3. Valida que los tipos sean correctos
4. Pide al agente que corrija el error específico

### Quiero personalizar un agente

Los archivos de configuración están en:
- `../.copilot/agents/flowbit-backend-agent.yaml`
- `../.copilot/agents/flowbit-frontend-agent.yaml`

Puedes editarlos para ajustar instrucciones, plantillas o convenciones.

---

## ✨ Beneficios de Usar los Agentes

1. ✅ **Consistencia:** Todo el código sigue las mismas convenciones
2. ✅ **Velocidad:** Genera código completo en segundos
3. ✅ **Calidad:** Aplica buenas prácticas automáticamente
4. ✅ **Educación:** Aprende de los ejemplos generados
5. ✅ **Escalabilidad:** Replica la arquitectura en otros proyectos
6. ✅ **Mantenibilidad:** Código estructurado y fácil de mantener

---

## 🚀 Replicar en Otros Proyectos

Para usar estos agentes en otros proyectos:

1. Copia la carpeta `.copilot/` a la raíz del nuevo proyecto
2. Ajusta las rutas en los archivos YAML si es necesario
3. Personaliza las instrucciones según la arquitectura del proyecto
4. ¡Listo! Los agentes estarán disponibles en el nuevo proyecto

---

## 📞 Soporte

Si tienes dudas sobre cómo usar los agentes:
1. Consulta la documentación en `.doc/`
2. Revisa los ejemplos de código existente
3. Pregunta al equipo de desarrollo

---

**Última actualización:** 7 de Febrero, 2026  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo FlowBit
