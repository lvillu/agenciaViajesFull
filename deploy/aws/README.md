# Deploy serverless en AWS (App Runner + Amplify + Aurora auto-pause)

Diseño "por uso": la BD baja a 0 ACU sin tráfico (~$0), App Runner mínimo
1 instancia (~$7.50), frontend Amplify por uso. Estimado a 30% de uso: **~$40/mes**.

## Paso 0 — Cuenta, región y rol OIDC (una vez)

1. Región recomendada: `us-east-1`.
2. Rol IAM para GitHub Actions (OIDC, sin keys):
   - Proveedor OIDC `token.actions.githubusercontent.com` + rol con política:
     `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`,
     `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`,
     `ecr:CompleteLayerUpload` sobre `agencia-api-*`.
   - Guardar el ARN en el repo: Settings → Variables → `AWS_DEPLOY_ROLE_ARN`.
3. Generar la clave JWT (64+ chars): `openssl rand -base64 48`.

## Paso 1 — Red

```bash
aws cloudformation deploy \
  --stack-name agencia-network-prod \
  --template-file deploy/aws/01-network.yaml \
  --parameter-overrides EnvironmentName=prod \
  --region us-east-1
```

## Paso 2 — Datos (Aurora Serverless v2, min 0 = auto-pause)

```bash
aws cloudformation deploy \
  --stack-name agencia-data-prod \
  --template-file deploy/aws/02-data.yaml \
  --parameter-overrides EnvironmentName=prod MinCapacity=0 MaxCapacity=4 \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

Pausa tras 30 min idle (default 5 min; 30 es más amable de noche):

```bash
aws rds modify-db-cluster --db-cluster-identifier <cluster-id> \
  --serverless-v2-scaling-configuration MinCapacity=0,MaxCapacity=4,SecondsUntilAutoPause=1800 \
  --region us-east-1
```

> Motor: la plantilla usa PG 16.x (auto-pause requiere 15.5+/16.x). Si AWS ya
> retiró esa versión menor, ajusta `EngineVersion` a la 16.x vigente.

## Paso 3 — Secreto de app (connection string + JWT)

```bash
ENDPOINT=$(aws rds describe-db-clusters --db-cluster-identifier <cluster-id> \
  --query 'DBClusters[0].Endpoint' --output text --region us-east-1)
SECRET=$(aws cloudformation describe-stacks --stack-name agencia-data-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`AppSecretArn`].OutputValue' --output text --region us-east-1)
aws secretsmanager put-secret-value --secret-id "$SECRET" --region us-east-1 --secret-string "{
  \"ConnectionStrings__IbarraTravelDB\": \"Host=$ENDPOINT;Port=5432;Database=ibarratravel;Username=postgres;Password=$(aws secretsmanager get-secret-value --secret-id /agencia/prod/db-master --query SecretString --output text --region us-east-1 | python3 -c 'import json,sys; print(json.load(sys.stdin)[\"password\"])');Command Timeout=120\",
  \"AppSettings__SecretKey\": \"<clave-de-64+-del-paso-0>\"
}"
```

> `Command Timeout=120` cubre el resume de auto-pause (15–60s). La app además
> reintenta transitorios (`EnableRetryOnFailure`, Fase 5).

## Paso 4 — App (ECR + App Runner con auto-deploy)

```bash
aws cloudformation deploy \
  --stack-name agencia-app-prod \
  --template-file deploy/aws/03-app.yaml \
  --parameter-overrides EnvironmentName=prod ImageTag=latest \
    AppSecretArn="$SECRET" \
    VpcConnectorArn="<output 01>" \
    CorsOrigins="https://app.tudominio.com" \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

Primera imagen (antes del primer auto-deploy):

```bash
# desde la raíz del repo, con AWS SSO/login hecho
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker buildx build --platform linux/amd64 -f backend/Dockerfile ./backend \
  -t <account>.dkr.ecr.us-east-1.amazonaws.com/agencia-api-prod:latest --push
```

Desde aquí, cada `push` a `main` redespliega solo (workflow `deploy.yml`).

## Paso 5 — Frontend (Amplify, 5 clics)

1. Amplify → New app → GitHub → rama `main`, app root **`frontend/`**.
2. Build spec: usa `frontend/amplify.yml` del repo (autodetectado).
3. Env var por rama: `NEXT_PUBLIC_API_URL=https://<apprunner-prod-url>` (Output `ServiceUrl` del paso 4).
4. Repetir para `dev` apuntando al App Runner dev.
5. Dominio custom en Amplify (HTTPS gratis incluido).

## Paso 6 — Verificar

```powershell
$env:E2E_BASE_URL = "https://<apprunner-prod-url>"
pwsh e2e/e2e-saas.ps1   # 64 checks contra prod (usa usuarios con timestamp, no toca datos reales)
```

> El script acepta `E2E_BASE_URL` (default `http://localhost:5050`).
> Ojo con el rate limiting (30 req/min/IP): no corras suites pegadas.

## Ambientes

| | dev | prod |
|---|---|---|
| Stacks | `agencia-{network,data,app}-dev` | `...-prod` |
| ECR tag | `:dev` | `:latest` |
| Amplify rama | `dev` | `main` |
| Aurora | min 0, max 2 | min 0 (ó 0.5 si exige SLA), max 4 |

## Rollback

- **App**: App Runner conserva revisiones; ante un deploy malo, el health check
  (`/health`) impide que reciba tráfico. Rollback manual = redeploy de revisión anterior en consola.
- **Infra**: `aws cloudformation delete-stack` en orden inverso (03 → 02 → 01).
  La BD tiene `DeletionProtection: true` + snapshot final se pide al borrar.
