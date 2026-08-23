# Docker Compose - Agencia Viajes

## 📋 Descripción
Esta configuración de Docker Compose levanta toda la infraestructura necesaria para la aplicación Agencia Viajes:
- **Frontend Next.js** - React 19 (Puerto 3100)
- **API .NET 8** - Backend en C# (Puerto 8080)
- **KrakenD** - API Gateway (Puerto 5050)
- **PostgreSQL** - Base de datos (Puerto 5432)

## 🚀 Cómo usar

### Requisitos previos
- Docker Desktop instalado
- Docker Compose instalado

### Iniciar los servicios

**Opción 1: Usando script (Recomendado)**

Windows (PowerShell):
```powershell
.\docker-compose.ps1 up -d
```

Linux/Mac (Bash):
```bash
./docker-compose.sh up -d
chmod +x docker-compose.sh  # Primera vez únicamente
```

**Opción 2: Directamente con --env-file**

```bash
docker-compose --env-file .env.development.local up -d
```

Los scripts automáticamente setean las variables desde `.env.development.local`.

### Detener los servicios

```bash
# Con script
.\docker-compose.ps1 down              # PowerShell
./docker-compose.sh down               # Bash

# O directamente
docker-compose --env-file .env.development.local down
```

### Ver logs

```bash
# Con script
.\docker-compose.ps1 logs -f           # Todos
.\docker-compose.ps1 logs -f api       # Solo API

# O directamente
docker-compose --env-file .env.development.local logs -f
```

### Acceder a los servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | `http://localhost:3100` | Next.js + React 19 |
| API | `http://localhost:8080` | .NET API Backend |
| KrakenD Gateway | `http://localhost:5050` | API Gateway (expone `/login`, `/signup`, `/users/me`, etc.) |
| PostgreSQL | `localhost:5432` | Base de datos

### Variables de entorno

Las variables de entorno se cargan desde `.env.development.local` al usar los scripts o el flag `--env-file`:

```bash
docker-compose --env-file .env.development.local up -d
```

**Variables disponibles en `.env.development.local`:**

```env
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ibarratravel

# .NET Configuration
ASPNETCORE_ENVIRONMENT=Development

# JWT Configuration
SECRET_KEY=GiveASecretKeyHavingAtLeast32Characters
EXPIRES_IN_MINUTES=2
REFRESH_TOKEN_EXPIRES_IN_MINUTES=60
```

Para usar diferentes valores, edita `.env.development.local` o crea un nuevo archivo `.env.{ambiente}.local`.

### Volúmenes

- `postgres_data`: Persiste los datos de PostgreSQL

### Redes

Se utiliza una red bridge llamada `agencia_viajes_network` para la comunicación entre contenedores.

## 🔧 Desarrollo

### Scripts para ejecutar

Los scripts `docker-compose.ps1` (PowerShell) y `docker-compose.sh` (Bash) automáticamente cargan `.env.development.local` para mayor comodidad:

```powershell
# PowerShell - Iniciar
.\docker-compose.ps1 up -d

# PowerShell - Detener
.\docker-compose.ps1 down

# PowerShell - Ver logs
.\docker-compose.ps1 logs -f
```

```bash
# Bash - Hacer ejecutable (primera vez)
chmod +x docker-compose.sh

# Bash - Iniciar
./docker-compose.sh up -d

# Bash - Detener
./docker-compose.sh down

# Bash - Ver logs
./docker-compose.sh logs -f
```

### Reconstruir imágenes

```bash
.\docker-compose.ps1 build              # PowerShell
./docker-compose.sh build               # Bash
docker-compose --env-file .env.development.local build
```

### Ejecutar con rebuild

```bash
.\docker-compose.ps1 up -d --build      # PowerShell
./docker-compose.sh up -d --build       # Bash
```

### Acceder a la base de datos

```bash
docker-compose --env-file .env.development.local exec database psql -U postgres -d ibarratravel
```

### Limpiar todo (incluidos volúmenes)

```bash
.\docker-compose.ps1 down -v            # PowerShell
./docker-compose.sh down -v             # Bash
docker-compose --env-file .env.development.local down -v
```

## 📝 Notas importantes

1. El **Frontend (Next.js)** se comunica con **KrakenD Gateway en puerto 5050** (NO directamente con la API)
2. La API se conecta a la BD usando el hostname `database` (nombre del servicio)
3. KrakenD se conecta a la API usando el hostname `api` (nombre del servicio)
4. El Frontend se comunica con KrakenD usando el hostname `krakend` internamente en la red Docker
5. Los puertos están mapeados para desarrollo local
6. El healthcheck de la BD se verifica antes de levantar la API

## 🔗 Flujo de comunicación

```
Frontend (localhost:3100)
    ↓
    └─→ KrakenD Gateway (localhost:5050)
        ↓
        └─→ .NET API (localhost:8080)
            ↓
            └─→ PostgreSQL (localhost:5432)
```

## 🚀 Flujo de inicio recomendado

Los servicios se inician en el siguiente orden (automáticamente con depends_on):

1. **PostgreSQL** (database) - Base de datos
2. **API .NET** - Backend (espera a que PostgreSQL esté listo)
3. **KrakenD** - API Gateway (espera a que API esté lista)
4. **Frontend Next.js** - Interfaz de usuario (espera a que KrakenD esté lista)

## 🐛 Troubleshooting

### Puerto ya en uso
```bash
# Cambiar el puerto en docker-compose.yml o matar el proceso

# Windows
netstat -ano | findstr :3100    # Frontend
netstat -ano | findstr :5050    # KrakenD
netstat -ano | findstr :8080    # API
netstat -ano | findstr :5432    # PostgreSQL

# Linux/Mac
lsof -i :3100    # Frontend
lsof -i :5050    # KrakenD
lsof -i :8080    # API
lsof -i :5432    # PostgreSQL
```

### Frontend no se conecta al Gateway
1. Verifica que el puerto 5050 esté correctamente mapeado
2. Revisa que `NEXT_PUBLIC_API_URL` apunte a `http://krakend:8080` dentro de Docker
3. En local (sin Docker), accede a `http://localhost:5050`

### DB no se conecta
```bash
# Verificar logs de la BD
docker-compose logs database

# Verificar conexión
docker-compose exec database pg_isready
```

### API no inicia
```bash
# Ver logs detallados
docker-compose logs api

# Verificar que la BD esté healthy
docker-compose ps
```

### KrakenD no inicia
```bash
# Ver logs
docker-compose logs krakend

# Verificar que la API esté disponible
docker-compose exec krakend curl http://api:8080
```

### Frontend no inicia
```bash
# Ver logs
docker-compose logs frontend

# Verificar que puede acceder a KrakenD
docker-compose exec frontend curl http://krakend:8080
```
