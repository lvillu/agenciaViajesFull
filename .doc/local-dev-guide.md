# Guía de Desarrollo Local — Agencia Viajes

Guía completa desde la instalación de Docker hasta las primeras pruebas de validación del stack completo.

---

## 1. Instalación de Docker

### Windows

1. Descarga **Docker Desktop** desde https://www.docker.com/products/docker-desktop
2. Ejecuta el instalador y sigue el asistente (requiere reinicio).
3. Activa la integración con WSL 2 cuando el instalador lo solicite (recomendado).
4. Verifica la instalación:

```powershell
docker --version
docker-compose --version
```

### macOS

```bash
# Con Homebrew
brew install --cask docker

# Luego abre Docker Desktop desde Aplicaciones y espera a que inicie
docker --version
docker-compose --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Permitir ejecutar Docker sin sudo
sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

---

## 2. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd agenciaViajesFull
```

---

## 3. Configurar Variables de Entorno

El proyecto usa un archivo `.env.development.local` en la raíz. El script de Docker Compose lo carga automáticamente.

Crea el archivo con los valores por defecto:

```powershell
# Windows (PowerShell)
Copy-Item .env.development.local.example .env.development.local
```

```bash
# macOS / Linux
cp .env.development.local.example .env.development.local
```

El archivo tiene esta estructura:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ibarratravel

# .NET Backend
ASPNETCORE_ENVIRONMENT=Development

# JWT
SECRET_KEY=GiveASecretKeyHavingAtLeast32Characters
EXPIRES_IN_MINUTES=2
REFRESH_TOKEN_EXPIRES_IN_MINUTES=60
```

> Cambia `SECRET_KEY` por una cadena segura de al menos 32 caracteres si planeas hacer pruebas con autenticación.

---

## 4. Levantar Todos los Servicios

Los scripts `docker-compose.ps1` y `docker-compose.sh` cargan el `.env.development.local` automáticamente y esperan a que las migraciones se apliquen antes de reportar éxito.

```powershell
# Windows (PowerShell) — desde la raíz del proyecto
.\docker-compose.ps1
```

```bash
# macOS / Linux
chmod +x docker-compose.sh   # Solo la primera vez
./docker-compose.sh
```

El comando anterior ejecuta `up -d` por defecto (modo desacoplado). Verás en consola el progreso de los contenedores y la confirmación de migraciones.

### Servicios que se levantan

| Contenedor                 | URL local                  | Descripción               |
|----------------------------|----------------------------|---------------------------|
| `agencia_viajes_frontend`  | http://localhost:3000      | Next.js (React 19)        |
| `agencia_viajes_api`       | http://localhost:8080      | .NET 8 API                |
| `agencia_viajes_krakend`   | http://localhost:5050      | API Gateway               |
| `agencia_viajes_db`        | localhost:5432             | PostgreSQL 16             |

---

## 5. Verificar que Todo Está Corriendo

```powershell
# Windows
.\docker-compose.ps1 ps

# macOS / Linux
./docker-compose.sh ps
```

Todos los servicios deben aparecer con estado `Up` o `running`.

---

## 6. Primeras Pruebas de Validación

### 6.1 Frontend

Abre http://localhost:3000 en el navegador. Debe cargar la pantalla de inicio de la aplicación.

### 6.2 API — Health Check

```powershell
# Windows
Invoke-RestMethod -Uri http://localhost:8080/health
```

```bash
# macOS / Linux
curl http://localhost:8080/health
```

Respuesta esperada: `Healthy` o un JSON con el estado de los subsistemas.

### 6.3 KrakenD — Gateway

```powershell
Invoke-RestMethod -Uri http://localhost:5050/__health
```

```bash
curl http://localhost:5050/__health
```

Respuesta esperada: `{"status":"ok"}`.

### 6.4 Base de Datos

```bash
# Conectarse al contenedor de PostgreSQL
docker exec -it agencia_viajes_db psql -U postgres -d ibarratravel

# Dentro de psql — listar tablas para confirmar migraciones
\dt

# Salir
\q
```

### 6.5 Flujo de Login completo

1. Abre http://localhost:3000 y navega al login.
2. Usa las credenciales de un usuario semilla (si existen) o regístra uno nuevo.
3. El frontend llama a KrakenD → API → PostgreSQL. Si el login es exitoso, el stack está funcionando correctamente.

---

## 7. Ver Logs en Tiempo Real

```powershell
# Todos los servicios
.\docker-compose.ps1 logs -f

# Un servicio específico
.\docker-compose.ps1 logs -f frontend
.\docker-compose.ps1 logs -f api
.\docker-compose.ps1 logs -f krakend
.\docker-compose.ps1 logs -f database
```

```bash
./docker-compose.sh logs -f
./docker-compose.sh logs -f api
```

---

## 8. Recargar Cambios en el Código

Cada servicio tiene su propia estrategia de recarga. Elige según qué parte cambiaste.

### 8.1 Frontend (Next.js)

Next.js tiene **Hot Module Replacement** automático en modo desarrollo. Si estás ejecutando el frontend fuera de Docker (`npm run dev`), los cambios se reflejan al guardar sin necesidad de reiniciar.

Si el frontend corre **dentro del contenedor** y necesitas reflejar cambios de código:

```powershell
# Reconstruir y reiniciar solo el frontend
.\docker-compose.ps1 up -d --build frontend
```

### 8.2 Backend .NET API

El contenedor de producción no tiene hot-reload. Después de cambiar código C#, reconstruye solo la API:

```powershell
# Reconstruir y reiniciar solo la API
.\docker-compose.ps1 up -d --build api
```

### 8.3 KrakenD (Gateway)

Después de editar `krakend.json` o `krakend.prod.tmpl`:

```powershell
# Reconstruir y reiniciar solo KrakenD
.\docker-compose.ps1 up -d --build krakend
```

### 8.4 Reconstruir Todo el Stack

Cuando los cambios afectan múltiples servicios o quieres partir de cero:

```powershell
# Windows
.\docker-compose.ps1 up -d --build

# macOS / Linux
./docker-compose.sh up -d --build
```

### 8.5 Reiniciar un Servicio sin Reconstruir

Útil cuando solo necesitas reiniciar el proceso (ej. cambio de variables de entorno):

```powershell
docker restart agencia_viajes_api
docker restart agencia_viajes_frontend
docker restart agencia_viajes_krakend
```

---

## 9. Parar los Servicios

```powershell
# Detener (conserva volúmenes y datos)
.\docker-compose.ps1 down

# Detener y eliminar volúmenes (borra los datos de PostgreSQL)
.\docker-compose.ps1 down -v
```

---

## 10. Solución de Problemas Comunes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Puerto ya en uso | Otro proceso usa 3000/5050/8080/5432 | Cambia el puerto en `docker-compose.yml` o detén el proceso conflictivo |
| API no arranca | Fallo en migraciones / DB no lista | Revisa `.\docker-compose.ps1 logs -f api` |
| Frontend muestra error de red | `NEXT_PUBLIC_API_URL` incorrecto | Verifica la variable en `.env.development.local` y reconstruye |
| `Error: No se encontró .env.development.local` | Falta el archivo de entorno | Ejecuta el paso 3 de esta guía |
| Contenedor se reinicia en bucle | Error en la app | Ejecuta `docker logs <nombre_contenedor>` para ver el error |
