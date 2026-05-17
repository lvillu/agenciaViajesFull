# Guía de despliegue en AWS — Agencia Viajes

---

## Primer despliegue

### Prerequisitos

- AWS CLI instalado y configurado (`aws configure`)
- Un **Key Pair** creado en us-east-1 (consola AWS → EC2 → Key Pairs)
- El archivo `.pem` descargado y con permisos correctos:
  ```bash
  chmod 400 tu-clave.pem
  ```

---

### Paso 1 — Desplegar la infraestructura EC2

```bash
aws cloudformation create-stack \
  --stack-name agencia-viajes-ec2 \
  --template-body file://infra/ec2.yaml \
  --parameters \
    ParameterKey=KeyName,ParameterValue=NOMBRE_DE_TU_KEY_PAIR \
    ParameterKey=RepoUrl,ParameterValue=https://github.com/TU_USUARIO/TU_REPO.git \
  --region us-east-1
```

Esperar a que termine (~2 min):
```bash
aws cloudformation wait stack-create-complete \
  --stack-name agencia-viajes-ec2 \
  --region us-east-1
```

Obtener los outputs y **anotar ambos valores**:
```bash
aws cloudformation describe-stacks \
  --stack-name agencia-viajes-ec2 \
  --query "Stacks[0].Outputs" \
  --region us-east-1
```

| Output | Para qué sirve |
|---|---|
| `ElasticIP` | IP pública fija del servidor (para conectarte por SSH y configurar la app) |
| `SecurityGroupId` | Se pasa como parámetro al stack de RDS |

---

### Paso 2 — Desplegar la base de datos RDS

```bash
aws cloudformation create-stack \
  --stack-name agencia-viajes-rds \
  --template-body file://infra/rds.yaml \
  --parameters \
    ParameterKey=EC2SecurityGroupId,ParameterValue=sg-XXXXXXXXXXXXXXXXX \
    ParameterKey=DBPassword,ParameterValue=TuPasswordSeguro123! \
  --region us-east-1
```

> Reemplaza `sg-XXXXXXXXXXXXXXXXX` con el `SecurityGroupId` del paso anterior.

Esperar a que termine (~10–15 min, RDS tarda más):
```bash
aws cloudformation wait stack-create-complete \
  --stack-name agencia-viajes-rds \
  --region us-east-1
```

Obtener el endpoint y **anotarlo**:
```bash
aws cloudformation describe-stacks \
  --stack-name agencia-viajes-rds \
  --query "Stacks[0].Outputs" \
  --region us-east-1
```

| Output | Para qué sirve |
|---|---|
| `DBEndpoint` | Hostname de la base de datos (valor de `RDS_HOST` en el `.env`) |

---

### Paso 3 — Configurar las variables de entorno en el servidor

Conectarse al EC2:
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

```bash
# Primero RDS (depende del SG del EC2)
aws cloudformation delete-stack --stack-name agencia-viajes-rds --region us-east-1
aws cloudformation wait stack-delete-complete --stack-name agencia-viajes-rds --region us-east-1

# Luego EC2
aws cloudformation delete-stack --stack-name agencia-viajes-ec2 --region us-east-1
```
