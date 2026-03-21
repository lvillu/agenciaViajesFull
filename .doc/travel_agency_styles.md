# Travel Agency - Sistema de Estilos y Componentes

## 📋 Índice
1. [Configuración Base](#configuración-base)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Layout - Header](#layout---header)
5. [Layout - Footer](#layout---footer)
6. [Tablas](#tablas)
7. [Modales](#modales)
8. [Formularios](#formularios)
9. [Componentes UI](#componentes-ui)

---

## Configuración Base

### TailwindCSS Config
```javascript
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ec5b13",
                "background-light": "#f8f6f6",
                "background-dark": "#221610",
            },
            fontFamily: {
                "display": ["Public Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
}
```

### Fuentes e Iconos
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>

<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Body Base
```html
<body class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
```

---

## Paleta de Colores

### Colores Principales
- **Primary Orange**: `#ec5b13` - Color principal de la marca
- **Background Light**: `#f8f6f6` - Fondo claro
- **Background Dark**: `#221610` - Fondo oscuro

### Colores de Estado
- **Success/Liquidado**: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
- **Warning/Pago Parcial**: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
- **Inactive**: `bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400`

### Colores de Texto
- **Primary Text**: `text-slate-900 dark:text-white`
- **Secondary Text**: `text-slate-600 dark:text-slate-400`
- **Muted Text**: `text-slate-500 dark:text-slate-500`

### Bordes
- **Default**: `border-slate-200 dark:border-slate-800`
- **Primary**: `border-primary/20 dark:border-primary/20`

---

## Tipografía

### Font Family
- **Principal**: `Public Sans` (via class `font-display`)

### Tamaños y Pesos
```css
/* Títulos Principales */
.title-hero: text-4xl font-extrabold

/* Títulos de Página */
.title-page: text-3xl font-extrabold (o font-black)

/* Subtítulos */
.title-section: text-xl font-bold

/* Subtítulos Pequeños */
.title-card: text-lg font-bold

/* Texto Regular */
.text-body: text-sm o text-base

/* Texto Pequeño */
.text-small: text-xs
```

---

## Layout - Header

### Header Principal (Página Principal)
**IMPORTANTE: Este es el Header que se debe usar en TODAS las pantallas**

```html
<header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between gap-4">
      <!-- Logo & Brand -->
      <div class="flex items-center gap-4">
        <div class="text-primary">
          <span class="material-symbols-outlined text-4xl">flight_takeoff</span>
        </div>
        <h2 class="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Agencia Viajes</h2>
      </div>
      
      <!-- Actions & Profile -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Notification Button -->
        <button class="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-background-dark"></span>
        </button>
        
        <!-- Divider -->
        <div class="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
        
        <!-- Profile Button -->
        <button class="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
            <span class="material-symbols-outlined text-primary">account_circle</span>
          </div>
          <span class="hidden sm:block text-sm font-medium pr-2">Admin User</span>
        </button>
      </div>
    </div>
  </div>
</header>
```

### Características del Header
- **Sticky**: `sticky top-0 z-50` - Permanece visible al hacer scroll
- **Backdrop Blur**: `backdrop-blur-md` - Efecto de desenfoque
- **Transparencia**: `bg-white/80` - Semi-transparente
- **Responsive**: Logo grande en desktop, compacto en móvil
- **Notificación**: Badge rojo indicador de notificaciones
- **Avatar**: Icono circular con borde primary

---

## Layout - Footer

### Footer Principal (Página Principal)
**IMPORTANTE: Este es el Footer que se debe usar en TODAS las pantallas**

```html
<footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-8">
  <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
    <!-- Brand Section -->
    <div class="flex items-center gap-2">
      <div class="text-primary flex items-center">
        <span class="material-symbols-outlined text-2xl">flight_takeoff</span>
      </div>
      <span class="font-bold text-slate-900 dark:text-white">Agencia Viajes</span>
      <span>© 2024 Management Suite</span>
    </div>
    
    <!-- Links Section -->
    <div class="flex gap-6">
      <a class="hover:text-primary transition-colors" href="#">Términos</a>
      <a class="hover:text-primary transition-colors" href="#">Privacidad</a>
      <a class="hover:text-primary transition-colors" href="#">Soporte Técnico</a>
    </div>
  </div>
</footer>
```

### Características del Footer
- **Border Top**: Línea divisoria superior
- **Responsive**: Stack vertical en móvil, horizontal en desktop
- **Links**: Hover con color primary
- **Copyright**: Incluye año y nombre de la suite

---

## Tablas

### Tabla de Gestión de Clientes

#### Container de Búsqueda (Sin botón de filtros)
```html
<div class="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-800">
  <div class="flex w-full items-center">
    <div class="text-slate-400 flex items-center justify-center pl-4">
      <span class="material-symbols-outlined">search</span>
    </div>
    <input 
      class="w-full border-none bg-transparent focus:ring-0 text-base py-3 px-3 placeholder:text-slate-400" 
      placeholder="Buscar clientes por nombre, email o teléfono..."
    />
  </div>
</div>
```

#### Estructura de Tabla
```html
<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Nombre
          </th>
          <!-- Más columnas... -->
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
          <td class="px-6 py-4 text-sm font-medium">Juan</td>
          <!-- Más celdas... -->
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Tabla de Reservas

#### Estructura Similar con Columnas Específicas
```html
<table class="w-full text-left border-collapse">
  <thead>
    <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
      <th class="px-6 py-4">Cliente</th>
      <th class="px-6 py-4">Proveedor</th>
      <th class="px-6 py-4">Descripción</th>
      <th class="px-6 py-4">Fecha Viaje</th>
      <th class="px-6 py-4">Total</th>
      <th class="px-6 py-4">Pagado</th>
      <th class="px-6 py-4">Saldo</th>
      <th class="px-6 py-4">Estado</th>
      <th class="px-6 py-4 text-center">Acciones</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
    <!-- Rows -->
  </tbody>
</table>
```

#### Celda con Avatar
```html
<td class="px-6 py-4 whitespace-nowrap">
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
      <span class="material-symbols-outlined text-lg">person</span>
    </div>
    <span class="font-medium text-slate-900 dark:text-slate-100 text-sm">Nombre Cliente</span>
  </div>
</td>
```

#### Badges de Estado
```html
<!-- Liquidado -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  LIQUIDADO
</span>

<!-- Pago Parcial -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
  PAGO PARCIAL
</span>
```

#### Botones de Acción
```html
<td class="px-6 py-4 whitespace-nowrap text-center">
  <div class="flex items-center justify-center gap-1">
    <!-- Ver -->
    <button class="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5" title="Ver detalle">
      <span class="material-symbols-outlined text-xl">visibility</span>
    </button>
    
    <!-- Pago -->
    <button class="p-2 text-slate-400 hover:text-green-500 transition-colors rounded-lg hover:bg-green-50" title="Registrar Pago">
      <span class="material-symbols-outlined text-xl">payments</span>
    </button>
    
    <!-- Editar -->
    <button class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100" title="Editar">
      <span class="material-symbols-outlined text-xl">edit</span>
    </button>
    
    <!-- Eliminar -->
    <button class="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Eliminar">
      <span class="material-symbols-outlined text-xl">delete</span>
    </button>
  </div>
</td>
```

#### Paginación
```html
<div class="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50">
  <span class="text-sm text-slate-500 dark:text-slate-400">Mostrando 1 a 4 de 24 clientes</span>
  <div class="flex items-center gap-2">
    <button class="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
      <span class="material-symbols-outlined text-lg">chevron_left</span>
    </button>
    <button class="flex items-center justify-center size-9 rounded-lg bg-primary text-white font-bold text-sm shadow-sm">1</button>
    <button class="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50 transition-colors text-sm">2</button>
    <button class="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50 transition-colors">
      <span class="material-symbols-outlined text-lg">chevron_right</span>
    </button>
  </div>
</div>
```

---

## Modales

### Modal Agregar Cliente

#### Overlay y Container
```html
<!-- Overlay -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
  <!-- Modal Container -->
  <div class="w-full max-w-lg overflow-hidden rounded-xl bg-white dark:bg-background-dark shadow-2xl">
    <!-- Header -->
    <div class="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">Agregar Cliente</h3>
      <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    
    <!-- Body -->
    <div class="p-6">
      <!-- Form content -->
    </div>
    
    <!-- Footer -->
    <div class="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-end gap-3">
      <button class="px-5 h-11 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        Cancelar
      </button>
      <button class="px-8 h-11 rounded-lg bg-primary text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-primary/20 transition-all">
        Crear
      </button>
    </div>
  </div>
</div>
```

### Modal Agregar Pago

#### Resumen Financiero
```html
<section>
  <h3 class="text-slate-900 dark:text-slate-100 text-sm font-semibold uppercase tracking-wider mb-4">
    Resumen Financiero
  </h3>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Total Reserva -->
    <div class="flex flex-col gap-1 rounded-lg p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Reserva</p>
      <p class="text-slate-900 dark:text-white text-lg font-bold leading-tight">$15,000.00</p>
    </div>
    
    <!-- Total Pagado -->
    <div class="flex flex-col gap-1 rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
      <p class="text-green-700 dark:text-green-400 text-xs font-medium">Total Pagado</p>
      <p class="text-green-600 dark:text-green-400 text-lg font-bold leading-tight">$7,000.00</p>
    </div>
    
    <!-- Saldo -->
    <div class="flex flex-col gap-1 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
      <p class="text-red-700 dark:text-red-400 text-xs font-medium">Saldo Actual</p>
      <p class="text-red-600 dark:text-red-400 text-lg font-bold leading-tight">$8,000.00</p>
    </div>
  </div>
</section>
```

### Modal Historial de Pagos

#### Header con Icono
```html
<header class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-primary/20 bg-white dark:bg-background-dark">
  <div class="flex items-center gap-3">
    <div class="p-2 bg-primary/10 rounded-lg text-primary">
      <span class="material-symbols-outlined leading-none">payments</span>
    </div>
    <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">
      Pagos de la Reserva
    </h2>
  </div>
  <button class="p-2 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-full transition-colors text-slate-500 dark:text-slate-400">
    <span class="material-symbols-outlined text-2xl">close</span>
  </button>
</header>
```

---

## Formularios

### Formulario de Reserva

#### Progress Tracker
```html
<div class="mb-10">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm font-semibold text-primary">RESERVATION PROGRESS</span>
    <span class="text-sm font-medium text-slate-500">Step 1 of 3 (Details)</span>
  </div>
  <div class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
    <div class="h-full bg-primary" style="width: 33.33%;"></div>
  </div>
</div>
```

#### Section con Header
```html
<section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
  <div class="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
    <span class="material-symbols-outlined text-primary">handshake</span>
    <h3 class="text-lg font-bold">Client & Provider Information</h3>
  </div>
  <!-- Form fields -->
</section>
```

#### Input Básico
```html
<div class="flex flex-col gap-2">
  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">
    Select Client
  </label>
  <input 
    class="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4" 
    placeholder="e.g. RES-2024-001" 
    type="text"
  />
</div>
```

#### Select
```html
<select class="w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4">
  <option value="">Search for a client...</option>
  <option>John Doe - JD10293</option>
</select>
```

#### Input con Icono
```html
<div class="flex flex-col gap-2">
  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount</label>
  <div class="relative">
    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
    <input 
      class="w-full h-12 pl-8 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4" 
      placeholder="0.00" 
      type="number"
    />
  </div>
</div>
```

#### Textarea
```html
<div class="flex flex-col gap-2">
  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
  <textarea 
    class="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary px-4 py-3" 
    placeholder="Enter reservation details, special requests or notes..." 
    rows="4"
  ></textarea>
</div>
```

#### Botones de Acción
```html
<div class="flex items-center justify-end gap-4 pt-4">
  <button 
    class="px-6 h-12 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
    type="button"
  >
    Cancelar
  </button>
  <button 
    class="px-10 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2" 
    type="submit"
  >
    <span class="material-symbols-outlined">save</span>
    Crear Reserva
  </button>
</div>
```

---

## Componentes UI

### Botones

#### Botón Primary
```html
<button class="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
  <span class="material-symbols-outlined text-xl">person_add</span>
  <span>Agregar Cliente</span>
</button>
```

#### Botón Secondary
```html
<button class="px-5 h-11 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
  Cancelar
</button>
```

#### Botón Icon Only
```html
<button class="flex items-center justify-center size-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-slate-50 transition-colors">
  <span class="material-symbols-outlined text-lg">chevron_left</span>
</button>
```

### Cards

#### Card Principal (Página Principal)
```html
<a class="group relative flex flex-col bg-white dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all hover:shadow-xl hover:-translate-y-1" href="#">
  <div class="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
    <span class="material-symbols-outlined text-3xl">groups</span>
  </div>
  <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Clientes</h3>
  <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
    Acceda a la base de datos de viajeros, perfiles de fidelidad e historial de compras.
  </p>
  <div class="mt-6 flex items-center text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
    Ver Directorio <span class="material-symbols-outlined text-sm ml-1">arrow_forward</span>
  </div>
</a>
```

### Badges

#### Status Badge - Activo
```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Activo
</span>
```

#### Status Badge - Inactivo
```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
  Inactivo
</span>
```

### Search Bar

```html
<div class="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-800">
  <div class="flex w-full items-center">
    <div class="text-slate-400 flex items-center justify-center pl-4">
      <span class="material-symbols-outlined">search</span>
    </div>
    <input 
      class="w-full border-none bg-transparent focus:ring-0 text-base py-3 px-3 placeholder:text-slate-400" 
      placeholder="Buscar clientes por nombre, email o teléfono..."
    />
  </div>
</div>
```

---

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Container Principal
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

### Grid Responsive
```html
<!-- Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Cards -->
</div>

<!-- Form Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Fields -->
</div>
```

---

## Dark Mode

### Toggle Classes
Todos los componentes deben incluir variantes dark:
- `dark:bg-background-dark`
- `dark:text-white`
- `dark:border-slate-800`
- `dark:hover:bg-slate-800`

### Ejemplo Completo
```html
<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
  <!-- Content -->
</div>
```

---

## Animaciones y Transiciones

### Hover States
```css
/* Botones */
hover:bg-primary/90 transition-all

/* Cards */
hover:shadow-xl hover:-translate-y-1 transition-all

/* Links */
hover:text-primary transition-colors
```

### Focus States
```css
focus:ring-primary focus:border-primary
```

---

## Iconos Material Symbols

### Iconos Comunes
- **flight_takeoff**: Logo principal
- **notifications**: Notificaciones
- **account_circle**: Perfil de usuario
- **groups**: Clientes
- **handshake**: Proveedores
- **confirmation_number**: Reservas
- **analytics**: Dashboard
- **search**: Búsqueda
- **filter_list**: Filtros
- **edit**: Editar
- **delete**: Eliminar
- **visibility**: Ver
- **payments**: Pagos
- **calendar_today**: Fecha
- **close**: Cerrar

### Uso
```html
<span class="material-symbols-outlined text-xl">icon_name</span>
```

---

## Notas Importantes

1. **Header y Footer**: SIEMPRE usar los de la página principal en todas las pantallas
2. **Color Primary**: #ec5b13 - No cambiar sin aprobación
3. **Fuente**: Public Sans - No sustituir
4. **Espaciado Consistente**: Usar escalas de Tailwind (px-4, px-6, px-8)
5. **Border Radius**: Preferir rounded-xl para cards y modales
6. **Sombras**: shadow-sm para cards, shadow-lg para botones principales
7. **Transiciones**: Siempre incluir transition-colors o transition-all
8. **Responsive**: Mobile-first approach

---

## Checklist de Implementación

Al crear un nuevo componente, verificar:
- [ ] Usa el Header de la página principal
- [ ] Usa el Footer de la página principal
- [ ] Color primary es #ec5b13
- [ ] Fuente es Public Sans
- [ ] Incluye variantes dark mode
- [ ] Es responsive (mobile-first)
- [ ] Tiene estados hover/focus
- [ ] Usa iconos Material Symbols
- [ ] Sigue la estructura de spacing
- [ ] Border radius consistente
