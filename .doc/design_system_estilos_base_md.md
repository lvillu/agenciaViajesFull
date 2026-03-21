# 📐 Design System – Estilos Base (Material UI)

Este Design System está **adaptado específicamente para Material UI (MUI v5)** y pensado para que **Copilot respete colores, tipografías, spacing y componentes** leyendo archivos `.md`.

---

## 📁 Estructura final de la carpeta

```text
/styles
 ├── colors.md
 ├── typography.md
 ├── spacing.md
 ├── shadows.md
 ├── layout.md
 ├── buttons.md
 ├── cards.md
 ├── sidebar.md
 └── mui-theme.md
```

---

## 🎨 colors.md

```md
# Colors – Material UI

## Palette
- primary.main: #2F80ED
- primary.light: rgba(47,128,237,0.1)
- secondary.main: #00B4D8

## Background
- background.default: #F7F9FC
- background.paper: #FFFFFF

## Text
- text.primary: #1F2937
- text.secondary: #6B7280
- text.disabled: #9CA3AF

## Status
- success.main: #27AE60
- warning.main: #F2C94C
- error.main: #EB5757

## Rules
- Do not introduce colors outside the MUI palette
- Prefer alpha() before new variants
```

---

## 🔤 typography.md

```md
# Typography – Material UI

## Font Family
- fontFamily: Inter, system-ui, sans-serif

## Variants
- h1: 20px / semibold
- h2: 18px / semibold
- h3: 16px / semibold
- subtitle1: 14px / medium
- body1: 13px / regular
- body2: 12px / regular

## Line Height
- Default: 1.4
- Headings: 1.2

## Rules
- Use Typography component exclusively
- Do not use inline font sizes
```

---

## 📏 spacing.md

```md
# Spacing – Material UI

## Base
- spacing unit: 8px (MUI default)

## Usage
- xs: theme.spacing(0.5)
- sm: theme.spacing(1)
- md: theme.spacing(2)
- lg: theme.spacing(3)
- xl: theme.spacing(4)

## Rules
- Use theme.spacing()
- No hardcoded pixel margins
```

---

## 🌫 shadows.md

```md
# Shadows – Material UI

## Custom Levels
- card: 0px 2px 8px rgba(0,0,0,0.04)
- hover: 0px 4px 16px rgba(0,0,0,0.06)

## Rules
- Use theme.shadows overrides
- Avoid default MUI heavy shadows
```

---

## 🧱 layout.md

```md
# Layout – Material UI

## Containers
- Max width: 1200px
- Padding X: theme.spacing(3)

## Grid
- Use MUI Grid (12 columns)
- Cards must stretch equally per row

## Rules
- Do not mix Grid and flex randomly
```

---

## 🔘 buttons.md

```md
# Buttons – Material UI

## Primary Button
- Component: Button
- variant: contained
- color: primary
- height: 40px
- borderRadius: 8px

## Secondary Button
- variant: text
- color: primary

## Icon Button
- Component: IconButton
- size: medium (36px)

## Rules
- No gradients
- Disable elevation by default
```

---

## 🃏 cards.md

```md
# Cards – Material UI

## Base
- Component: Card
- borderRadius: 12px
- elevation: 0
- background: background.paper

## Content
- Icon (Avatar or Box)
- Typography for title and meta
- LinearProgress for progress

## Hover
- Increase shadow to hover level

## Rules
- No Card borders
- Padding via CardContent only
```

---

## 📚 sidebar.md

```md
# Sidebar – Material UI

## Base
- Component: Drawer (permanent)
- width: 240px
- background: background.paper

## Items
- Component: ListItemButton
- height: 40px
- icon + label

## Active State
- background: primary.light
- text color: primary.main

## Rules
- Icons must be MUI icons
- No truncation
```

---

## 🎛 mui-theme.md

```md
# MUI Theme Rules

## Theme Creation
- Use createTheme()
- Centralize palette, typography, spacing, shape

## Shape
- borderRadius: 12

## Components Overrides
- Button: disableElevation
- Card: elevation 0
- Drawer: no border

## Rules
- No inline sx for colors or spacing
- Use theme values only
```

---

## 📊 tables.md

```md
# Tables – Material UI

## TableHead
- Component: TableHead
- Background: grey.50 (bgcolor: 'grey.50')
- Cell font weight: 600

## TableBody
- Hover state: '&:hover': { bgcolor: 'grey.50' }
- Loading/Empty states: py: 4, textAlign: 'center'

## TableCell Typography
- Primary data: variant="body1", fontWeight: 500
- Secondary data: variant="body2", color="text.secondary"

## TableContainer
- Max height with scroll: maxHeight: 600, overflowY: 'auto'

## Rules
- Always use hover effect on TableRow
- Use Typography component inside cells
- Consistent spacing for empty states
```

---

## 🏷️ chips.md

```md
# Chips – Material UI

## Status Chips
- Component: Chip
- Size: small
- Colors: success, error, warning
- Text color: #FFFFFF
- Font weight: 500

## Usage
- Active/Inactive states
- Status indicators (Liquidado, Pendiente, etc.)

## Rules
- Always set fontWeight: 500
- Always set color: '#FFFFFF' for text
- Use semantic colors (success, error, warning)
```

---

## 🔍 search.md

```md
# Search Field – Material UI

## TextField Search
- Component: TextField
- Size: small
- fullWidth: true
- Placeholder: descriptive text
- InputAdornment: start position with SearchIcon

## Spacing
- Margin bottom: mb: 3 (inside Card)

## Rules
- Always include SearchIcon in startAdornment
- Use descriptive placeholders
```

---

## 🖱️ iconbuttons.md

```md
# Icon Buttons – Material UI

## Base
- Component: IconButton
- Size: small
- Colors: primary, error, success, info, inherit

## With Title
- Add title prop for native tooltips
- Examples: "Editar", "Eliminar", "Ver Pagos"

## Container
- Display: flex
- Gap: 0.5 (4px)
- Justify content: center

## Rules
- Always use color prop
- Always add title for accessibility
- Group in Box with flex layout
```

---

## 💬 dialogs.md

```md
# Dialogs – Material UI

## Base Dialog
- Component: Dialog
- maxWidth: xs, sm, md (según contenido)
- fullWidth: true

## DialogTitle
- Use Typography variant="h2" inside

## DialogContent
- Default padding applies

## DialogActions
- Padding: p: 2
- Gap: gap: 1
- Buttons: outlined + contained

## Rules
- Always set maxWidth and fullWidth
- Use consistent button variants
- Add gap between action buttons
```

---

## 🤖 Copilot Prompt recomendado

"Ajusta este componente usando Material UI y respeta estrictamente el design system definido en `/styles/*.md`. No introduzcas colores, tamaños ni sombras fuera del theme."

