# Agencia Viajes - Frontend

Frontend del sistema de gestión de viajes construido con **Next.js 15** y **React 19**.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Lenguaje**: TypeScript 5
- **Styling**: Material UI 6 + Emotion
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Formularios**: React Hook Form + Zod
- **Confirmaciones**: SweetAlert2

## 📦 Instalación

### Prerequisites
- Node.js 18+ 
- npm o yarn

### Setup

1. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` si necesitas cambiar la URL del API:
```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js (App Router)
│   ├── page.tsx           # Home page (protegida)
│   ├── layout.tsx         # Layout raíz
│   ├── login/             # Página de login
│   ├── signup/            # Página de registro
│   └── settings/          # Página de configuración
│
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes primitivos (Input, Button)
│   └── shared/           # Componentes compartidos (Header)
│
├── hooks/                # Custom hooks
│   └── useAuth.ts        # Hook de autenticación
│
├── services/             # Servicios HTTP
│   ├── apiClient.ts      # Cliente HTTP con Axios
│   ├── authService.ts    # Servicios de autenticación
│   └── userService.ts    # Servicios de usuario
│
├── store/               # Zustand stores
│   └── authStore.ts     # Store de autenticación
│
├── types/              # Tipos TypeScript
│   ├── api.ts          # Tipos de respuestas API
│   └── user.ts         # Tipos de usuario
│
└── lib/               # Utilidades
    └── validationSchemas.ts  # Esquemas Zod
```

## 🔐 Autenticación

### Flujo de Login
1. Usuario ingresa credenciales (userName + password)
2. Se validan en el formulario con Zod
3. Se envía a `POST /login` vía KrakenD
4. Se recibe token y userName
5. Se almacena en Zustand + localStorage
6. Se redirige a home

### Flujo de SignUp
1. Usuario completa formulario de registro
2. Se validan campos (incluida confirmación de password)
3. Se envía a `POST /signup` vía KrakenD
4. Se recibe token y userName
5. Se almacena en Zustand + localStorage
6. Se redirige a home

### Propiedades del Usuario (User.cs)
```csharp
- Id: int
- Name: string
- LastName: string
- UserName: string
- Email: string
- PasswordHash: string
- RefreshToken?: string
- RefreshTokenExpiryTime?: DateTime
- UserIconUrl?: string
- Active: bool
```

## 🔌 API Gateway

El frontend comunica **SIEMPRE** a través del **KrakenD Gateway** en el puerto 5050.

```
Frontend (3000) → Gateway (5050) → Backend (8080)
```

**URLs de API:**
- `POST /login` - Iniciar sesión
- `POST /signup` - Crear cuenta
- `POST /logout` - Cerrar sesión
- `GET /users/me` - Obtener info del usuario autenticado

## 🎨 Componentes Principales

### Login Page
- Username y password
- Validación con Zod
- Link a página de signup
- Manejo de errores

### SignUp Page
- Formulario de registro completo
- Validación de campos
- Confirmación de password
- Link a login

### Header
- Logo/nombre de app
- Avatar del usuario con nombre
- Menú desplegable con Settings y Logout
- Logout con SweetAlert2

### Settings Page
- Información del usuario protegida
- Llamada a `/users/me`
- Card blanco que ocupa el espacio
- Avatar, nombre, usuario, email

### Home Page
- Protegida (requiere autenticación)
- Header visible
- Vacía por ahora (expandible)

## 🔒 Rutas Protegidas

Las siguientes páginas requieren autenticación:
- `/` (home)
- `/settings` (configuración)

Si no estás autenticado, serás redirigido a `/login`.

## 📋 Validaciones

### Login
- userName: mínimo 3 caracteres
- password: mínimo 6 caracteres

### SignUp
- name: mínimo 2 caracteres
- lastName: mínimo 2 caracteres
- userName: mínimo 3 caracteres
- email: debe ser email válido
- password: mínimo 6 caracteres
- confirmPassword: debe coincidir con password

## 🛠️ Desarrollo

### Scripts disponibles
```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Compilar para producción
npm start        # Ejecutar build de producción
npm run lint     # Ejecutar linter
```

### Hot Reload
Los cambios se reflejan automáticamente en el navegador durante desarrollo.

## 🌐 Comunicación API

### Request Headers
Todas las peticiones incluyen automáticamente el header de autenticación:
```
Authorization: Bearer {token}
```

### Response Format
Todas las respuestas siguen este formato:
```json
{
  "data": { /* Datos específicos */ },
  "status": "Completed|Failure",
  "message": "Descripción",
  "isSuccess": true|false
}
```

## 🆘 Troubleshooting

### Error: ENOENT: no such file or directory
Asegúrate de haber instalado dependencias:
```bash
npm install
```

### Error: Cannot find module '@mui/material'
Reinstala las dependencias:
```bash
npm install
```

### Error: API connection refused
Verifica que:
1. El KrakenD Gateway está corriendo en puerto 5050
2. La variable `NEXT_PUBLIC_API_URL` es correcta en `.env.local`

### Error: 401 Unauthorized
Tu token ha expirado. Vuelve a iniciar sesión.

## 📝 Notas Importantes

- **Nunca** almaces contraseñas en el navegador
- **Token**: Se almacena en localStorage vía Zustand
- **CORS**: Configurado en KrakenD Gateway
- **Autorización**: Header `Authorization: Bearer {token}` automático
- **Errores 401**: Desloguea automáticamente

## 🚀 Deploy

Para producción:

1. **Build**
```bash
npm run build
```

2. **Variables de entorno**
Configura `NEXT_PUBLIC_API_URL` para tu ambiente de producción.

3. **Deploy**
Puedes deployar en Vercel, Netlify, o tu servidor preferido.

## 📖 Documentación Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Material UI Docs](https://mui.com)
- [Zustand Docs](https://zustand-demo.vercel.app/)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

## 🤝 Contribuir

Si contribuyes al proyecto:
1. Sigue la estructura de carpetas
2. Usa TypeScript en todo
3. Valida formularios con Zod
4. Mantén componentes simples y reutilizables

---

**Última actualización**: Febrero 2026
