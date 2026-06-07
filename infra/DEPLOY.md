# Guía de despliegue en AWS — Agencia Viajes

---

## Primer despliegue

### Prerequisitos

- Cuenta AWS con acceso a la consola ([console.aws.amazon.com](https://console.aws.amazon.com))
- Región seleccionada: **us-east-1** (N. Virginia) — verificarlo en la esquina superior derecha de la consola
- Un **Key Pair** creado (consola → EC2 → Network & Security → **Key Pairs** → Create key pair)
  - Tipo: **RSA**, formato: **.pem**
  - Descargarlo y guardarlo en un lugar seguro — solo se descarga una vez

---

### Paso 1 — Desplegar la infraestructura EC2

1. Ir a la consola → **CloudFormation** → **Stacks** → **Create stack** → **With new resources (standard)**
2. En *Specify template* elegir **Upload a template file** → subir `infra/ec2.yaml` → **Next**
3. Rellenar los parámetros:

| Parámetro | Valor |
|---|---|
| **Stack name** | `agencia-viajes-ec2` |
| **KeyName** | Nombre del Key Pair creado en el prerequisito |
| **RepoUrl** | `https://github.com/TU_USUARIO/TU_REPO.git` |
| **BranchName** | Rama a desplegar (ej. `master`, `dev`) — por defecto `master` |
| **VpcId** | Seleccionar la VPC por defecto de la lista |
| **SshAllowedCidr** | Tu IP pública + `/32` (ej. `203.0.113.5/32`) — o `0.0.0.0/0` solo para pruebas |
| **AmiId** | Dejar el valor por defecto (se resuelve automáticamente) |

4. Hacer clic en **Next** → **Next** → **Submit**
5. Esperar ~2 min hasta que el estado sea **CREATE_COMPLETE** (refrescar con el ícono 🔄)
6. Ir a la pestaña **Outputs** del stack y **anotar ambos valores**:

| Output | Para qué sirve |
|---|---|
| `ElasticIP` | IP pública fija del servidor (para SSH y configurar la app) |
| `SecurityGroupId` | Se pasa como parámetro al stack de RDS |

---

### Paso 2 — Desplegar la base de datos RDS

1. Ir a **CloudFormation** → **Stacks** → **Create stack** → **With new resources (standard)**
2. En *Specify template* elegir **Upload a template file** → subir `infra/rds.yaml` → **Next**
3. Rellenar los parámetros:

| Parámetro | Valor |
|---|---|
| **Stack name** | `agencia-viajes-rds` |
| **EC2SecurityGroupId** | El `SecurityGroupId` obtenido en el paso anterior |
| **VpcId** | La misma VPC por defecto que elegiste para el EC2 |
| **DBPassword** | Password seguro de mínimo 8 caracteres — **anotarlo** |
| **DBUsername** | `postgres` (valor por defecto) |
| **DBName** | `ibarratravel` (valor por defecto) |
| **BackupRetentionPeriod** | `7` (valor por defecto) |

4. Hacer clic en **Next** → **Next** → **Submit**
5. Esperar ~10–15 min hasta **CREATE_COMPLETE** (RDS tarda más que EC2)
6. Ir a la pestaña **Outputs** del stack y **anotar**:

| Output | Para qué sirve |
|---|---|
| `DBEndpoint` | Hostname de la base de datos (valor de `RDS_HOST` en el `.env`) |

---

### Paso 3 — Configurar las variables de entorno en el servidor

Conectarse al EC2 via SSH usando el `ElasticIP` del paso 1:
```bash
ssh -i tu-clave.pem ubuntu@TU_ELASTIC_IP
```

Editar el archivo `.env`:
```bash
nano /home/ubuntu/agenciaViajesFull/.env
```

Rellenar los siguientes valores:

| Variable | Valor |
|---|---|
| `RDS_HOST` | `DBEndpoint` obtenido en el paso anterior |
| `POSTGRES_PASSWORD` | El password que usaste al crear el stack RDS |
| `SECRET_KEY` | Clave JWT aleatoria de mínimo 32 caracteres |
| `CORS_ALLOWED_ORIGIN` | `http://TU_ELASTIC_IP:3000` |
| `CORS_ALLOWED_ORIGINS` | `http://TU_ELASTIC_IP:3000` |
| `NEXT_PUBLIC_API_URL` | `http://TU_ELASTIC_IP:5050` |

Guardar y salir: `Ctrl+O` → `Enter` → `Ctrl+X`

---

### Paso 4 — Levantar la aplicación

```bash
cd /home/ubuntu/agenciaViajesFull
docker compose -f docker-compose.prod.yml up -d --build
```

Verificar que todos los contenedores están corriendo:
```bash
docker compose -f docker-compose.prod.yml ps
```

Verificar que la API responde:
```bash
curl http://localhost:8080/health
```

La aplicación estará disponible en:
- **Frontend:** `http://TU_ELASTIC_IP:3000`
- **API Gateway:** `http://TU_ELASTIC_IP:5050`

---

## Subir una actualización

Cuando hayas hecho cambios en el código y quieras desplegarlos en producción:

### 1 — Conectarse al servidor

```bash
ssh -i tu-clave.pem ubuntu@TU_ELASTIC_IP
cd /home/ubuntu/agenciaViajesFull
```

### 2 — Descargar los últimos cambios

```bash
git pull origin master
```

### 3 — Reconstruir y reiniciar los contenedores

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

> El flag `--build` fuerza la reconstrucción de las imágenes con el nuevo código.
> Los contenedores que no cambiaron se reinician sin reconstruir, minimizando el downtime.

### 4 — Verificar que todo sigue funcionando

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:8080/health
```

### Limpiar imágenes antiguas (opcional, libera espacio en disco)

Después de varias actualizaciones pueden acumularse imágenes sin usar:
```bash
docker image prune -f
```

---

## Comandos útiles en el servidor

```bash
# Ver logs en tiempo real de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f backend

# Reiniciar un servicio sin reconstruir
docker compose -f docker-compose.prod.yml restart backend

# Detener toda la aplicación
docker compose -f docker-compose.prod.yml down

# Ver uso de disco
docker system df
```

---

## Eliminar la infraestructura

> Eliminar primero RDS, ya que depende del Security Group del EC2.

1. Ir a **CloudFormation** → **Stacks** → seleccionar `agencia-viajes-rds` → **Delete** → confirmar
2. Esperar a que desaparezca de la lista (~5 min)
3. Seleccionar `agencia-viajes-ec2` → **Delete** → confirmar
