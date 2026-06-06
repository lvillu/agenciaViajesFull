# Plan de Migración "Ola Marina"

Nueva paleta de colores para el frontend de AgenciaViajes.

## Paleta Final

| Color | Hex | Rol MUI | Uso |
|-------|-----|---------|-----|
| Teal | `#5BA9B3` | `primary.main` | Botones, enlaces, activos |
| Teal 10% | `rgba(91,169,179,0.1)` | `primary.light` | Fondos iconos, hovers |
| Lavender | `#BDBFDC` | `secondary.main` | Acentos secundarios |
| Lavender tint | `rgba(189,191,220,0.18)` | `background.default` | Fondo página |
| White | `#FFFFFF` | `background.paper` | Cards, modales |
| Dark gray | `#525252` | `text.primary` | Texto principal |
| Lavender-gray | `#8B8DA8` | `text.secondary` | Texto secundario |
| Soft lavender | `#D8DAEA` | `divider` | Bordes, divisores |
| Purple | `#AD61D5` | — | Iconos especiales |
| Magenta | `#CB38DA` | — | Hover states, badges |

### Se mantienen (colores semánticos)
- Success: `#16a34a` — chips "Activo", "Liquidado"
- Warning: `#ca8a04` — chips "Pago Parcial"
- Error: `#dc2626` — chips "Vencido", errores

## Archivos a modificar (25 total)

### FASE 1 — Fundación
| # | Archivo | Cambios |
|---|---------|---------|
| 1 | `frontend/src/app/layout.tsx` | Tema MUI completo |
| 2 | `frontend/src/styles/ta-globals.css` | 15 referencias `#ec5b13` → `#5BA9B3` |

### FASE 2 — UI Primitives
| # | Archivo | Cambios |
|---|---------|---------|
| 3 | `frontend/src/components/ui/Button.tsx` | VARIANT_STYLES colores y sombras |
| 4 | `frontend/src/components/ui/Input.tsx` | Bordes, bg, label, text colors |
| 5 | `frontend/src/components/ui/DateInput.tsx` | Icon color, label color |

### FASE 3 — Layout
| # | Archivo | Cambios |
|---|---------|---------|
| 6 | `frontend/src/components/shared/Header.tsx` | Swal confirmButtonColor |
| 7 | `frontend/src/components/shared/Footer.tsx` | — (auto via theme) |
| 8 | `frontend/src/components/shared/Breadcrumbs.tsx` | — (auto via theme) |

### FASE 4 — Pages Auth
| # | Archivo | Cambios |
|---|---------|---------|
| 9 | `frontend/src/app/login/page.tsx` | ~18 hardcoded colors |
| 10 | `frontend/src/app/signup/page.tsx` | ~14 hardcoded colors |

### FASE 5 — Pages CRUD
| # | Archivo | Cambios |
|---|---------|---------|
| 11 | `frontend/src/app/page.tsx` | — (auto via theme) |
| 12 | `frontend/src/app/clientes/page.tsx` | Table bg, hovers, chips, pagination |
| 13 | `frontend/src/app/proveedores/page.tsx` | Table bg, acronym box, chips |
| 14 | `frontend/src/app/reservas/page.tsx` | Table bg, status chips, hovers |

### FASE 6 — Pages Resto
| # | Archivo | Cambios |
|---|---------|---------|
| 15 | `frontend/src/app/reservas/nueva/page.tsx` | ~25 hardcoded colors |
| 16 | `frontend/src/app/dashboard/page.tsx` | Refresh btn, divider |
| 17 | `frontend/src/app/settings/page.tsx` | Icon box, CircularProgress |

### FASE 7 — Shared Modals
| # | Archivo | Cambios |
|---|---------|---------|
| 18 | `frontend/src/components/shared/MenuCard.tsx` | — (auto via theme) |
| 19 | `frontend/src/components/shared/ClientFormModal.tsx` | Close btn hover, actions bg |
| 20 | `frontend/src/components/shared/ProviderFormModal.tsx` | SectionHeader icon color, actions bg |
| 21 | `frontend/src/components/shared/AddPaymentModal.tsx` | ~15 hardcoded colors |
| 22 | `frontend/src/components/shared/ViewPaymentsModal.tsx` | ~15 hardcoded colors |
| 23 | `frontend/src/components/shared/PaymentReceiptModal.tsx` | ~10 colors + gradiente |

### FASE 8 — Feature Components
| # | Archivo | Cambios |
|---|---------|---------|
| 24 | `frontend/src/components/features/dashboard/DashboardCards.tsx` | Icon bg/color/accent |
| 25 | `frontend/src/components/features/dashboard/DashboardCharts.tsx` | Chart colors, icon colors |

## Asignación de Chart Colors

| Gráfica | Antes | Después |
|---------|-------|---------|
| Ventas mensuales (bar) | Indigo `#6366f1` | Teal `rgba(91,169,179,0.75)` |
| Ganancias mensuales (bar) | Green `#16a34a` | Teal `rgba(91,169,179,0.75)` |
| Proveedores (dona) | Naranja | `#5BA9B3`, `#AD61D5`, `#CB38DA`, `#BDBFDC` |
| Icon Ventas | `#6366f1` | `#5BA9B3` |
| Icon Proveedores | `#ec5b13` | `#AD61D5` |
| Icon Ganancias | `#16a34a` | `#5BA9B3` |
| Tooltip bg | `#221610` | `#525252` |
| Ejes grid | `#f1f5f9` | `#D8DAEA` |
| Ejes ticks | `#475569`/`#94a3b8` | `#8B8DA8` |

## PaymentReceiptModal

| Elemento | Antes | Después |
|----------|-------|---------|
| Gradiente header | `linear-gradient(135deg, #a63b00, #f26522)` | `linear-gradient(135deg, #3D7A82, #5BA9B3)` |
| Icon box | `rgba(236,91,19,0.1)` + `#ec5b13` | `primary.light` + `primary.main` |
| CircularProgress | `#ec5b13` | `primary.main` |
| Borders `#e1bfb3` | Naranja claro | `#BDBFDC` |
| "PAGADO" text `#a63b00` | Naranja oscuro | `#3D7A82` |
| "PAGADO" bg | `rgba(242,101,34,0.08)` | `rgba(91,169,179,0.08)` |
| "ABONO" text `#a63b00` | Naranja oscuro | `primary.main` |
| Breakdown bg | `#f8fafc` | Lavender tint |

## DashboardCards

| Elemento | Antes | Después |
|----------|-------|---------|
| Card 1 icon bg/color/accent | `#ec5b13` | `#5BA9B3` |
| Card 2 icon bg/color/accent | `#6366f1` | `#AD61D5` |
| Card 3 | `#ca8a04` | Sin cambios |
| Tabla modal hover | `rgba(236,91,19,0.04)` | `rgba(91,169,179,0.04)` |
| Tabla modal header | `#f8f6f6` | `background.default` |
