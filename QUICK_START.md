# Guía Rápida - Stack Completo con Docker

## 🚀 Iniciar TODO (Base de Datos + API + Gateway + Frontend)

### Windows (PowerShell)
```powershell
# Desde la raíz del proyecto
.\docker-compose.ps1
# O con logs
.\docker-compose.ps1 up -d && .\docker-compose.ps1 logs -f
```

### Linux/Mac (Bash)
```bash
# Desde la raíz del proyecto
chmod +x docker-compose.sh
./docker-compose.sh
# O con logs
./docker-compose.sh up -d && ./docker-compose.sh logs -f
```

## 📋 Comandos Comunes

### Ver estado de servicios
```powershell
# Windows
docker-compose --env-file .env.development.local ps

# Linux/Mac
docker-compose --env-file .env.development.local ps
```

### Ver logs de un servicio específico
```powershell
# Frontend
.\docker-compose.ps1 logs -f frontend

# API
.\docker-compose.ps1 logs -f api

# KrakenD
.\docker-compose.ps1 logs -f krakend

# Base de datos
.\docker-compose.ps1 logs -f database
```

### Entrar a un contenedor
```bash
# Frontend
docker-compose exec frontend sh

# API
docker-compose exec api sh

# Base de datos
docker-compose exec database psql -U postgres -d ibarratravel
```

### Parar todos los servicios
```powershell
# Windows
.\docker-compose.ps1 down

# Linux/Mac
./docker-compose.sh down
```

### Limpiar completamente (incluyendo volúmenes)
```powershell
# Windows
.\docker-compose.ps1 down -v

# Linux/Mac
./docker-compose.sh down -v
```

## 🌐 URLs para Acceder

| Servicio | URL | Credenciales |
|----------|-----|-------------|
| **Frontend** | http://localhost:3100 | - |
| **API** | http://localhost:8080 | - |
| **KrakenD Gateway** | http://localhost:5050 | - |
| **PostgreSQL** | localhost:5432 | user: `postgres` / pass: `postgres` |

## 📱 Flujo de Login

1. Abre http://localhost:3100
2. Accede a la pantalla de login
3. Ingresa credenciales
4. El frontend se comunica con http://localhost:5050 (KrakenD)
5. KrakenD redirige a http://localhost:8080 (API)
6. La API accede a PostgreSQL

## ⚠️ Requisitos Previos

- ✅ Docker Desktop instalado
- ✅ Archivo `.env.development.local` en la raíz del proyecto
- ✅ Puertos 3100, 5050, 8080, 5432 disponibles

## 🔧 Configurar Variables de Entorno

Copia `.env.development.local.example` a `.env.development.local`:

```powershell
# Windows
Copy-Item .env.development.local.example .env.development.local

# Linux/Mac
cp .env.development.local.example .env.development.local
```

Edita `.env.development.local` si necesitas valores diferentes.

## 🚀 Desarrollo Sin Docker

Si prefieres ejecutar localmente sin Docker:

### Terminal 1: Base de datos
```bash
# Asume PostgreSQL corriendo en puerto 5432
```

### Terminal 2: Backend API
```bash
cd backend
dotnet run
# Ejecutará en http://localhost:8080
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
# Ejecutará en http://localhost:3000
# Usa .env.local con NEXT_PUBLIC_API_URL=http://localhost:5050
```

## 📝 Estructura del Proyecto

```
agenciaViajesFull/
├── docker-compose.yml       # Configuración de servicios
├── docker-compose.ps1       # Script para Windows
├── docker-compose.sh        # Script para Linux/Mac
├── .env.development.local   # Variables de entorno (NO COMMIT)
├── DOCKER.md                # Documentación detallada
│
├── backend/                 # .NET 8 API
│   ├── Dockerfile
│   ├── agenciaViajes.Api/
│   └── agenciaViajes.Application/
│
├── frontend/                # Next.js 15 + React 19
│   ├── Dockerfile
│   ├── src/
│   │   ├── app/            # Páginas
│   │   ├── components/     # Componentes
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios HTTP
│   │   ├── store/          # Estado Zustand
│   │   └── types/          # Tipos TypeScript
│   └── package.json
│
└── deploy/
    └── KrakenD/
        ├── Dockerfile
        └── krakend.json    # Configuración del gateway
```

## 🔌 Integración Frontend-Backend

El frontend **SIEMPRE** se comunica a través de KrakenD Gateway:

```
Frontend (localhost:3100) 
  ↓
  → KrakenD (localhost:5050)
    ↓
    → API Backend (localhost:8080)
      ↓
      → PostgreSQL (localhost:5432)
```

## 💡 Tips &amp; Tricks

### Reconstruir imágenes
```powershell
.\docker-compose.ps1 build
# O con cambios obligados
.\docker-compose.ps1 up -d --build
```

### Ver espacios en disco
```bash
docker system df
```

### Limpiar imágenes no usadas
```bash
docker image prune -a
```

### Acceder a logs históricos
```bash
docker-compose logs --tail 100 frontend
```

## 🆘 Problemas Comunes

### "Port already in use"
Cambia los puertos en `docker-compose.yml` o cierra la aplicación que ocupa el puerto.

### Frontend no se conecta a API
- Verifica que KrakenD esté corriendo: `docker-compose ps`
- Revisa logs: `docker-compose logs krakend`
- Confirma puerto 5050: `netstat -ano | findstr 5050`

### Base de datos no se inicializa
- Revisa logs: `docker-compose logs database`
- Recrea el volumen: `docker-compose down -v && docker-compose up -d`

### Cambios en el código no se reflejan
- En desarrollo sin Docker: Guarda el archivo (hot reload)
- Con Docker: Reconstruye la imagen `docker-compose up -d --build`

---

**Para más información:** Ver [DOCKER.md](DOCKER.md) y [frontend/README.md](frontend/README.md)
