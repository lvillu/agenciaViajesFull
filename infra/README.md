# Infraestructura AWS — Agencia Viajes

Dos stacks de CloudFormation independientes que crean toda la infraestructura en AWS Free Tier.

```
infra/
├── ec2.yaml   → EC2 t2.micro + Elastic IP + Security Group
└── rds.yaml   → RDS PostgreSQL 16 db.t3.micro
```

---

## Orden obligatorio de despliegue

> El EC2 debe desplegarse **primero** porque su Security Group ID se necesita como parámetro en el stack de RDS.

```
1. Desplegar ec2.yaml  →  obtener SecurityGroupId + ElasticIP
2. Desplegar rds.yaml  →  pasar SecurityGroupId como parámetro
3. SSH al EC2          →  editar .env con el DBEndpoint del RDS
4. Levantar la app     →  docker compose -f docker-compose.prod.yml up -d --build
```

---

## 1. Prerequisitos

- AWS CLI configurado (`aws configure`)
- Un **Key Pair** creado en la región donde desplegarás (EC2 → Key Pairs en la consola)

---

## 2. Desplegar EC2

```bash
aws cloudformation create-stack \
  --stack-name agencia-viajes-ec2 \
  --template-body file://infra/ec2.yaml \
  --parameters \
    ParameterKey=KeyName,ParameterValue=NOMBRE_DE_TU_KEY_PAIR \
    ParameterKey=RepoUrl,ParameterValue=https://github.com/TU_USUARIO/TU_REPO.git \
  --region us-east-1
```

Esperar a que el stack esté `CREATE_COMPLETE` (~2 min):
```bash
aws cloudformation wait stack-create-complete \
  --stack-name agencia-viajes-ec2 \
  --region us-east-1
```

Obtener los outputs:
```bash
aws cloudformation describe-stacks \
  --stack-name agencia-viajes-ec2 \
  --query "Stacks[0].Outputs" \
  --region us-east-1
```

Anota los valores de:
- `ElasticIP` → IP pública fija del servidor
- `SecurityGroupId` → la necesitas para el paso siguiente

---

## 3. Desplegar RDS

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

Esperar (~10–15 min, RDS tarda más):
```bash
aws cloudformation wait stack-create-complete \
  --stack-name agencia-viajes-rds \
  --region us-east-1
```

Obtener el endpoint:
```bash
aws cloudformation describe-stacks \
  --stack-name agencia-viajes-rds \
  --query "Stacks[0].Outputs" \
  --region us-east-1
```

Anota `DBEndpoint` → lo necesitas para el `.env`.

---

## 4. Configurar el servidor y lanzar la app

```bash
# Conectarse al EC2
ssh -i tu-clave.pem ubuntu@TU_ELASTIC_IP

# Editar las variables de entorno con los valores reales
nano /home/ubuntu/agenciaViajesFull/.env
```

Valores que debes rellenar en `.env`:

| Variable | Valor |
|---|---|
| `RDS_HOST` | El `DBEndpoint` del stack RDS |
| `POSTGRES_PASSWORD` | El mismo password que usaste al crear el stack RDS |
| `SECRET_KEY` | Clave JWT aleatoria de mínimo 32 caracteres |
| `CORS_ALLOWED_ORIGIN` | `http://TU_ELASTIC_IP:3000` |
| `CORS_ALLOWED_ORIGINS` | `http://TU_ELASTIC_IP:3000` |
| `NEXT_PUBLIC_API_URL` | `http://TU_ELASTIC_IP:5050` |

Levantar la app por primera vez:
```bash
cd /home/ubuntu/agenciaViajesFull
docker compose -f docker-compose.prod.yml up -d --build
```

Verificar que todo esté corriendo:
```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:8080/health
```

---

## Eliminar la infraestructura

```bash
# Primero RDS (que depende del SG del EC2)
aws cloudformation delete-stack --stack-name agencia-viajes-rds --region us-east-1
aws cloudformation wait stack-delete-complete --stack-name agencia-viajes-rds --region us-east-1

# Luego EC2
aws cloudformation delete-stack --stack-name agencia-viajes-ec2 --region us-east-1
```

---

## Costos estimados (sin Free Tier, us-east-1, On-Demand)

| Recurso | Detalle | $/mes aprox. |
|---|---|---|
| EC2 t2.micro | $0.0116/h × 730 h | ~$8.47 |
| EBS gp2 20 GB | $0.10/GB-mes | ~$2.00 |
| RDS db.t3.micro (single-AZ) | $0.017/h × 730 h | ~$12.41 |
| RDS storage gp2 20 GB | $0.115/GB-mes | ~$2.30 |
| Elastic IP (asociada a instancia activa) | $0.00 | $0.00 |
| Transferencia saliente (~5 GB estimado) | $0.09/GB | ~$0.45 |
| **Total estimado** | | **~$25–26/mes** |

> **Alternativa económica:** correr PostgreSQL en Docker en el mismo EC2 elimina el RDS (~$15/mes de ahorro), reduciendo el total a ~$10–11/mes. La contrapartida es perder los backups automáticos y el failover gestionado de RDS.
