# 📖 Ejemplos Prácticos - FlowBit Agents

Esta guía contiene ejemplos completos de cómo usar los agentes de FlowBit en escenarios reales del día a día.

---

## 🎯 Escenarios Backend (.NET)

### Ejemplo 1: Crear un nuevo módulo de Clientes

**Paso 1: Crear la entidad y repositorio**
```
@flowbit-backend crea la entidad Customer con los siguientes campos:
- Id (int)
- Name (string, máx 100 caracteres)
- Email (string, formato email)
- Phone (string, opcional)
- Active (bool)
- CreatedAt (DateTime)

También crea su interfaz de repositorio ICustomerRepository con métodos CRUD básicos.
```

**Paso 2: Crear el Command para crear clientes**
```
@flowbit-backend crea una feature CreateCustomer con:
- CreateCustomerCommand que acepte Name, Email, Phone
- CreateCustomerHandler que use ICustomerRepository
- CreateCustomerValidator con validaciones:
  * Name obligatorio, entre 3 y 100 caracteres
  * Email obligatorio y formato válido
  * Phone opcional pero si existe, mínimo 7 dígitos
- CreateCustomerRequest y CustomerResponse como DTOs
```

**Paso 3: Crear Query para listar clientes**
```
@flowbit-backend crea una feature GetCustomers con paginación:
- GetCustomersQuery que acepte pageNumber y pageSize
- GetCustomersHandler que retorne lista paginada
- CustomerResponse con todos los campos de la entidad
```

**Resultado:** Un módulo completo de Clientes siguiendo Vertical Slice Architecture.

---

### Ejemplo 2: Agregar filtros a una consulta existente

```
@flowbit-backend modifica GetProductsQuery para agregar filtros opcionales:
- categoryId (int?)
- minPrice (decimal?)
- maxPrice (decimal?)
- searchTerm (string?)

El Handler debe aplicar estos filtros dinámicamente usando LINQ.
```

---

### Ejemplo 3: Implementar soft delete

```
@flowbit-backend crea un DeleteProductCommand que implemente soft delete:
- No elimine físicamente el registro
- Actualice el campo Active a false
- Actualice un campo DeletedAt con la fecha actual
- Incluya validación que el producto exista
```

---

### Ejemplo 4: Command con lógica de negocio compleja

```
@flowbit-backend crea un ProcessOrderCommand con la siguiente lógica:
1. Validar que todos los productos existan y tengan stock
2. Calcular el total de la orden
3. Restar del stock de cada producto
4. Crear el registro de la orden
5. Crear los registros de OrderItems
6. Retornar la orden completa con sus items

Usar transacciones para garantizar consistencia.
```

---

## 🎨 Escenarios Frontend (Next.js/React)

### Ejemplo 1: Crear una página de listado con búsqueda

**Paso 1: Crear el servicio**
```
@flowbit-frontend crea customersService con métodos:
- getAll() → retorna Customer[]
- getById(id) → retorna Customer
- search(term) → retorna Customer[] filtrado por nombre o email
- create(customer) → crea nuevo cliente
- update(id, customer) → actualiza cliente
- delete(id) → elimina cliente
```

**Paso 2: Crear el hook**
```
@flowbit-frontend crea useCustomers hook que:
- Maneje estado de customers, loading, error
- Exponga función search(term) para buscar
- Exponga función refresh() para recargar
- Use useEffect para cargar inicial
- Maneje errores correctamente
```

**Paso 3: Crear la página**
```
@flowbit-frontend crea la página /dashboard/clientes con:
- Input de búsqueda en tiempo real
- DataTable con columnas: ID, Nombre, Email, Teléfono, Acciones
- Botones de Editar y Eliminar por fila
- Botón "Nuevo Cliente" que abra un modal
- Estados de loading y error
```

**Resultado:** Una página completa y funcional de gestión de clientes.

---

### Ejemplo 2: Formulario con validación completa

```
@flowbit-frontend crea un componente CustomerForm con:
- React Hook Form para gestión del formulario
- Zod schema para validación:
  * name: requerido, min 3, max 100 caracteres
  * email: requerido, formato email
  * phone: opcional, formato teléfono
- Validación en tiempo real
- Mensajes de error debajo de cada campo
- Botón Submit deshabilitado si hay errores
- Manejo de estado de loading al enviar
- Props: onSubmit, initialValues (opcional), isEdit (bool)
```

---

### Ejemplo 3: Modal reutilizable

```
@flowbit-frontend crea un componente Modal genérico con:
- Props: isOpen, onClose, title, children, size
- Backdrop con click para cerrar
- Botón X en la esquina
- Animación de entrada/salida
- Responsive (se ajusta a mobile)
- Bloqueo de scroll del body cuando está abierto
- Usa Material UI Dialog como base
```

---

### Ejemplo 4: Dashboard con gráficos

```
@flowbit-frontend crea un componente Dashboard que:
- Muestre 4 cards con métricas (Total Ventas, Productos, Clientes, Órdenes)
- Gráfico de líneas con ventas de los últimos 7 días
- Gráfico de barras con productos más vendidos
- Tabla con últimas 5 órdenes
- Use un hook useDashboard para cargar datos
- Maneje loading y error states
- Use Chart.js o Recharts para gráficos
```

---

## 🔄 Escenarios Full-Stack

### Ejemplo 1: CRUD completo de Categorías

**Backend:**
```
@flowbit-backend crea un CRUD completo de Categories:

1. Entidad Category con: Id, Name, Description, Active, CreatedAt
2. ICategoryRepository con métodos CRUD
3. Features:
   - CreateCategory (Command)
   - UpdateCategory (Command)
   - DeleteCategory (Command - soft delete)
   - GetCategory (Query - por ID)
   - GetCategories (Query - lista paginada)
4. Validaciones apropiadas en cada Command
5. DTOs Request/Response
```

**Frontend:**
```
@flowbit-frontend crea la interfaz completa de categorías:

1. categoriesService con todos los métodos CRUD
2. useCategories hook con estado y acciones
3. Página /dashboard/categorias con:
   - Lista de categorías en DataTable
   - Botón "Nueva Categoría"
   - Botones Editar/Eliminar por fila
4. Componente CategoryForm para crear/editar
5. Modal para confirmar eliminación
6. Tipos TypeScript para Category
```

---

### Ejemplo 2: Sistema de autenticación

**Backend:**
```
@flowbit-backend crea un sistema de autenticación:

1. Feature LoginCommand que:
   - Acepte Email y Password
   - Valide credenciales contra BD
   - Genere JWT token
   - Retorne usuario + token
2. Feature RefreshTokenCommand
3. Middleware para validar JWT en requests
```

**Frontend:**
```
@flowbit-frontend crea el sistema de auth en el frontend:

1. authService con login, logout, refreshToken
2. authStore (Zustand) que persista usuario y token
3. Componente LoginForm con validación
4. ProtectedRoute HOC para rutas privadas
5. Interceptor en apiClient para agregar token
6. Manejo de expiración de token
```

---

## 🔧 Escenarios de Refactorización

### Ejemplo 1: Migrar a AutoMapper

```
@flowbit-backend refactoriza ProductHandler para usar AutoMapper:
1. Crea el perfil ProductMappingProfile
2. Mapea CreateProductRequest → Product
3. Mapea Product → ProductResponse
4. Actualiza el Handler para usar _mapper.Map<>()
5. Elimina mapeo manual
```

---

### Ejemplo 2: Extraer lógica duplicada a un hook

```
@flowbit-frontend tengo lógica duplicada en componentes de productos y categorías 
para manejar DataTable con paginación. 

Crea un hook genérico useDataTable<T> que:
- Acepte los datos y configuración de paginación
- Maneje cambio de página
- Maneje cambio de items por página
- Retorne datos de la página actual
- Retorne controles de paginación
```

---

## 🎓 Patrones Avanzados

### Backend: Command con múltiples repositorios

```
@flowbit-backend crea CreateOrderWithItemsCommand que:
- Inyecte IOrderRepository e IProductRepository
- Valide stock de productos
- Cree la orden
- Cree los items de la orden
- Actualice el stock de productos
- Todo en una transacción
- Retorne OrderResponse con items incluidos
```

---

### Frontend: Infinite Scroll

```
@flowbit-frontend crea useInfiniteProducts hook que:
- Cargue productos en lotes de 20
- Detecte scroll hasta el final
- Cargue automáticamente siguiente página
- Muestre loading solo para nuevos datos
- No duplique productos al cargar
- Maneje fin de datos (no hay más)
```

---

### Backend: Event Sourcing básico

```
@flowbit-backend implementa un sistema básico de eventos de dominio:
- Interfaz IDomainEvent
- Clase DomainEventDispatcher
- ProductCreatedEvent, ProductUpdatedEvent
- Handlers para cada evento que registren en una tabla de auditoría
```

---

### Frontend: Optimistic Updates

```
@flowbit-frontend modifica useProducts para implementar optimistic updates:
- Al crear producto, agregarlo inmediatamente a la lista
- Si falla el API, revertir el cambio
- Mostrar indicador visual de "guardando..."
- Al eliminar, quitarlo inmediatamente
- Si falla, restaurarlo con mensaje de error
```

---

## 💡 Tips para Obtener Mejores Resultados

### 1. Sé explícito con los tipos de datos

❌ Malo:
```
@flowbit-backend crea una feature para productos
```

✅ Bueno:
```
@flowbit-backend crea CreateProductCommand con campos:
- Description (string, max 200)
- Price (decimal, 2 decimales)
- Quantity (int, min 1)
- CategoryId (int, debe existir en BD)
```

---

### 2. Especifica validaciones de negocio

❌ Malo:
```
@flowbit-frontend crea un formulario de productos
```

✅ Bueno:
```
@flowbit-frontend crea ProductForm con validaciones Zod:
- Precio mínimo 0.01, máximo 999999.99
- Cantidad mínima 1
- Descripción requerida, entre 5 y 200 caracteres
- Categoría requerida (select)
```

---

### 3. Indica el flujo completo

❌ Malo:
```
@flowbit-backend crea un endpoint de órdenes
```

✅ Bueno:
```
@flowbit-backend crea ProcessOrderCommand que:
1. Valide productos y stock
2. Calcule total
3. Actualice stock
4. Cree orden con items
5. Envíe email de confirmación (llamar a IEmailService)
6. Retorne orden completa con número de confirmación
```

---

### 4. Menciona dependencias

```
@flowbit-frontend crea useDashboard hook que:
- Use dashboardService para cargar datos
- Use authStore para obtener userId
- Actualice datos cada 30 segundos
- Limpie el intervalo en unmount
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto
- **Arquitectura:** `./project_overview.md`
- **Guía rápida:** `./README.md`
- **Agentes:** `./agents-README.md`

### Plantillas
- **Backend:** Ver `../.copilot/agents/flowbit-backend-agent.yaml`
- **Frontend:** Ver `../.copilot/agents/flowbit-frontend-agent.yaml`

---

## ✅ Checklist: Antes de Pedir al Agente

- [ ] ¿Tengo claro qué quiero lograr?
- [ ] ¿Sé qué módulo/entidad afecta?
- [ ] ¿Conozco los campos/props necesarios?
- [ ] ¿Tengo claro las validaciones de negocio?
- [ ] ¿Sé dónde va el código (qué carpeta)?
- [ ] ¿He revisado si existe algo similar que pueda reutilizar?

Si respondiste SÍ a todo, ¡estás listo para usar el agente! 🚀

---

**Última actualización:** 7 de Febrero, 2026  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo FlowBit
