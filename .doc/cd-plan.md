# Plan — Continuous Deployment (GitHub Actions → EC2)

> Fecha: 2026-10-05 (rev. 2026-10-06: rama productiva = `dev`). Alcance: solo diseño/plan, sin implementar el workflow todavía.

## 1. Lo que encontró la revisión de infra

| Pieza | Estado actual |
|---|---|
| Compute | EC2 `t3.micro` (1 GB RAM) + swap 2 GB + Docker CE + compose plugin + BuildKit. Repo clonado en `/home/ubuntu/agenciaViajesFull`, `.env` copiado desde `.env.prod.example` (`infra/ec2.yaml:82-129`) |
| DB | RDS PostgreSQL 16 `db.t3.micro`, no público, solo acepta 5432 desde el SG del EC2, backups 7 días (`infra/rds.yaml`) |
| IP | Elastic IP fija — los secrets/hosts no cambian al reiniciar ✅ |
| Compose prod | `docker-compose.prod.yml`: `api` (límite 350m, healthcheck a `/health`), `krakend` (128m, CORS por env), `frontend` standalone (350m, `NEXT_PUBLIC_API_URL` como **build-arg**) |
| API | Aplica migraciones EF automáticamente al arrancar (`MigrateAsync` en `Program.cs:110`) y expone `/health` (`Program.cs:130`) |
| CI actual | `.github/workflows/ci.yml`: build+tests backend, lint+tests+build frontend, en PR/push a `dev` y `main`. **No hay CD** |
| Red | SG abre 22, 3000, 5050, 80. El 8080 de la API queda solo en red interna ✅ |
| Deploy actual | 100 % manual: SSH → `git pull` → `compose up -d --build` (`infra/DEPLOY.md`) |

### ⚠️ Inconsistencia a corregir antes del CD

1. **Rama productiva = `dev`** (decisión 2026-10-06). `ec2.yaml` ya clona `dev` por defecto ✅, pero `DEPLOY.md` dice `git pull origin master` (rama que no existe) → corregir a `dev`.
2. **`NEXT_PUBLIC_API_URL` se hornea en el build** (`frontend/Dockerfile:35-36`). El valor correcto vive en el `.env` del EC2, no en GitHub. El CD **no debe** pasarlo desde secrets salvo que se migre a dominio fijo.

## 2. Recomendaciones

### R1. Estrategia: SSH + `git pull` + `compose up --build` (sin registry)
- **Recomendada** para este tamaño. Cero piezas nuevas, aprovecha el caché de capas Docker + swap ya configurados.
- Alternativa descartada por ahora: pre-compilar en GHCR y hacer `pull` en EC2. Solo compensa si los builds en el `t3.micro` superan ~10 min o dan OOM de forma recurrente.

### R2. El CD corre solo en `dev`, después del CI en verde
- Trigger: `push` a `dev` + `workflow_dispatch` (botón manual para reintentos).
- Gate: el job de deploy debe depender de los mismos checks del CI (usar `workflow_call`/reutilizar o `needs` + Branch Protection con checks requeridos). **Nunca desplegar con tests rojos.**

### R3. Los secretos de app NO salen del EC2
- Lo que vive solo en `/home/ubuntu/agenciaViajesFull/.env` (RDS_HOST, passwords, SECRET_KEY, CORS, NEXT_PUBLIC_API_URL) **no se replica a GitHub Secrets**.
- El workflow solo necesita 3 secrets de acceso: `EC2_HOST`, `EC2_USER` (ubuntu), `EC2_SSH_KEY` (clave dedicada solo-deploy, distinta a la personal).
- El workflow debe **verificar que `.env` existe y fallar con mensaje claro** si falta, jamás crearlo/sobrescribirlo.

### R4. Endurecer SSH (el punto débil del diseño)
- Abrir el 22 a GitHub Actions implica internet (IPs de runners dinámicas). Mitigaciones mínimas:
  - Clave ED25519 dedicada al deploy, sin passphrase compartida, rotación documentada.
  - `StrictHostKeyChecking` con host key fijado en secret (no `accept-new` a ciegas en prod).
  - `fail2ban` + auth solo por clave en el EC2.
- Evolución futura (no parte de este plan): Session Manager (SSM) para cerrar el 22 por completo.

### R5. Deploy con verificación y rollback definidos
- Orden de arranque ya correcto en el compose: `api` (healthy) → `krakend` → `frontend`.
- Post-deploy obligatorio: `compose ps` + `curl /health` (8080) + chequeo 5050/3000 + `docker image prune -f` (disco de 20 GB).
- Rollback de código = `git fetch + checkout <tag/sha anterior> + up --build`. Exigir tags en `dev` para tener a qué volver.
- Rollback de DB: ver §3-bis (las migraciones auto-aplicadas **no** hacen rollback con `git checkout`; tienen su propio procedimiento).

### R6. Environment `production` sin aprobadores (deploy automático)
- Decisión 2026-10-06: el deploy es **automático al hacer merge/push a `dev`**, sin revisores en el environment.
- El environment `production` se conserva solo como-owned para secrets/protección de ramas, no como gate manual.

### R7. Blindar las migraciones automáticas (riesgo principal del CD)
Contexto: la API ejecuta `MigrateAsync` al arrancar (`Program.cs:110`). Eso significa que en cuanto el contenedor nuevo levanta —aunque el resto del deploy falle (KrakenD, frontend, healthchecks)— **la DB ya quedó migrada** y un `git checkout` anterior no la revierte. El plan para prevenirlo tiene 4 capas:

1. **Clasificar cada migración en la PR (regla de equipo)**
   - 🟢 *Segura / auto-aplicable*: `ADD COLUMN nullable`, `CREATE TABLE`, `CREATE INDEX CONCURRENTLY`, nuevos `DEFAULT`s. Puede ir por CD normal.
   - 🔴 *Destructiva / requiere procedimiento*: `DROP COLUMN/TABLE`, `ALTER COLUMN TYPE`, `NOT NULL` sin default, `RENAME`, borrado o reescritura de datos. **Prohibido auto-aplicar**: exige ventana manual con snapshot + verificación (punto 3).
   - La etiqueta 🟢/🔴 se pone en la descripción de la PR y la revisa el aprobador del environment `production`.
2. **Migraciones compatibles hacia atrás (expand/contract)**
   - Los cambios de esquema se hacen en 2 deploys: (1) deploy que solo *agrega* lo nuevo sin usarlo + código que lee/escribe ambas formas; (2) deploy posterior que *remueve* lo viejo. Así, si el deploy N falla y se vuelve al código N-1, la DB migrada sigue siendo compatible con el código anterior.
   - Regla práctica: **el código nuevo debe funcionar con la DB vieja, y el código viejo debe funcionar con la DB nueva**. Si eso no se cumple, es migración 🔴.
3. **Respaldo antes de migrar**
   - Hoy RDS tiene backups automáticos (retención 7 días) ✅, pero restaurar un backup automático implica downtime y pérdida de lo escrito después del snapshot.
   - Procedimiento para migraciones 🔴: snapshot manual en consola RDS → desplegar → verificar `/health` + smoke test → si falla, restaurar snapshot (documentar ventana de pérdida). Para migraciones 🟢 basta el backup automático.
   - Evolución (no MVP): crear el snapshot desde el propio workflow con credenciales AWS de solo-RDS (`rds:CreateDBSnapshot`), para que quede ligado al deploy.
4. **Probar la migración antes de producción**
   - Añadir al CI un job que levante PostgreSQL 16 efímero (service container), aplique `dotnet ef database update` y corra los tests: detecta migraciones rotas *antes* del CD.
   - El CD verifica `/health` tras `up --build`, que confirma que la API arrancó y migró sin excepciones.
   - Evolución (no MVP): sacar `MigrateAsync` del arranque y migrar como paso explícito del CD (contenedor one-shot `api-migrate` antes de levantar la API). Da control total del orden backup → migrate → verify → serve, pero exige tocar `Program.cs` y el compose; evaluarlo cuando haya una migración 🔴 real.

## 3. Plan de implementación

### Fase 0 — Pre-requisitos manuales (una sola vez)
- [ ] Fijar `dev` como rama productiva; corregir `DEPLOY.md` (`master` → `dev`). `ec2.yaml` ya usa `dev` ✅ (solo verificar).
- [ ] Generar clave deploy: `ssh-keygen -t ed25519 -f deploy_key`, añadir la pública a `~/.ssh/authorized_keys` del EC2.
- [ ] Crear secrets del repo: `EC2_HOST` (ElasticIP), `EC2_USER=ubuntu`, `EC2_SSH_KEY` (privada), `EC2_HOST_KEY` (salida de `ssh-keyscan`).
- [ ] Crear environment `production` **sin** required reviewers (deploy automático; decisión 2026-10-06).
- [ ] Verificar en EC2: `.env` completo, `docker compose -f docker-compose.prod.yml ps` en verde.

### Fase 1 — Workflow `.github/workflows/cd.yml` (nuevo)
- [ ] Trigger `push: branches: [dev]` + `workflow_dispatch`, `concurrency: group: cd-production` (sin `cancel-in-progress`: un deploy no se interrumpe).
- [ ] Job `gates`: reutiliza los checks del CI (o `needs` a workflow de CI vía `workflow_call`); si falla, no hay deploy.
- [ ] Job `preflight-migrations` (nuevo, implementa R7):
  1. Detecta si el push trae migraciones: `git diff --name-only <sha-anterior> <sha-nuevo> | grep -i migrations`.
  2. Si no hay migraciones → sigue el deploy normal.
  3. Si hay migraciones 🟢 → sigue, y el post-deploy verifica `/health` (confirma que `MigrateAsync` no lanzó excepción).
  4. Si la PR está etiquetada 🔴 (destructiva) → **falla el job con mensaje** indicando que requiere el procedimiento manual (snapshot RDS + ventana + verificación), salvo que se lance por `workflow_dispatch` con confirmación explícita.
- [ ] Job `deploy` (`environment: production`, `needs: [gates, preflight-migrations]`):
  1. Escribe la llave a archivo con `0600`, añade host key a `known_hosts`.
  2. SSH al EC2 y ejecuta script remoto con `set -euo pipefail`:
     ```bash
     cd /home/ubuntu/agenciaViajesFull
     test -f .env || { echo "Falta .env en el servidor"; exit 1; }
     git fetch origin dev && git checkout dev && git pull --ff-only origin dev
     docker compose -f docker-compose.prod.yml up -d --build
     docker compose -f docker-compose.prod.yml ps
     curl -fsS http://localhost:8080/health
     curl -fsS -o /dev/null http://localhost:5050/
     curl -fsS -o /dev/null http://localhost:3000/
     docker image prune -f
     ```
  3. Timeouts generosos (20–30 min: el build en `t3.micro` con swap es lento).
  4. En fallo: volcar `compose logs --tail=200` como artefacto y fallar el job.

### Fase 2 — Pruebas
- [ ] Probar con `workflow_dispatch` antes de mergear nada a `dev`.
- [ ] Mergear un cambio menor a `dev`, verificar deploy automático + healthchecks.
- [ ] Probar rollback de código: checkout del tag anterior + `up --build`.
- [ ] Simulacro de migración 🟢: PR con `ADD COLUMN nullable`, verificar que el preflight la deja pasar y `/health` queda verde.

### Fase 3 — Endurecimiento (post-MVP)
- [ ] Cambiar IP literals por dominio + HTTPS (Nginx/Caddy + certbot; puerto 80 ya abierto y reservado en el SG).
- [ ] `COOKIE_SECURE=true` cuando haya HTTPS.
- [ ] Evaluar GHCR si los builds superan ~10 min de forma habitual.
- [ ] Alertas de disco (`docker system df`).
- [ ] Automatizar snapshot RDS desde el workflow + migrar a paso explícito de migración (contenedor one-shot) en lugar de `MigrateAsync` al arrancar.

## 4. Qué NO incluye este plan
- Cambios en CloudFormation (infra ya creada, no se toca).
- Gestión de secretos de app fuera del `.env` del EC2 (sin Secrets Manager: overkill para esta escala).
- Blue/green o zero-downtime real (imposible sin LB + 2 instancias; el `restart` del compose deja segundos de corte en frontend).

## 5. Decisiones (cerradas)
1. Rama productiva: `dev` ✅
2. Deploy **automático** al hacer merge/push a `dev`, sin aprobador ✅ (2026-10-06)

> ⏸️ Implementación en pausa: no hacer nada hasta que el plan sea leído y aprobado.
