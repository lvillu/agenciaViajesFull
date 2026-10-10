# Revisión de seguridad (OWASP Top 10) y plan de mitigación

## Hallazgos

| # | Severidad | Archivo | Líneas | Vulnerabilidad | OWASP | Confianza |
|---|-----------|---------|--------|----------------|-------|-----------|
| 1 | HIGH | `backend/agenciaViajes.Application/Features/Configurations/Routes/AuthRoutes.cs`, `Features/Auth/SignUp/SignUpHandler.cs`, `Features/Configurations/Routes/ClientRoutes.cs` | 24-30 / 29-39 / 21-23 | `/signup` público crea cuentas activas; las rutas de negocio solo exigen autenticación, sin roles. Cualquiera accede a clientes, ventas y pagos. | A01 Broken Access Control | 9/10 |
| 2 | HIGH | `backend/agenciaViajes.Api/appsettings.json`, `docker-compose.yml` | 13-18 / 40-48 | Clave JWT fija por defecto; permite forjar tokens. | A07 Auth Failures | 9/10 |
| 3 | HIGH | `.env.prod.example`, `docker-compose.prod.yml`, `AuthRoutes.cs` | 28-45 / varias / 85-94 | Producción por HTTP, `COOKIE_SECURE=false` y puertos expuestos sin TLS; se pueden robar JWT y refresh token. | A02 Crypto / A07 | 9/10 |
| 4 | MEDIUM | `docker-compose.prod.yml` | 27 | `Trust Server Certificate=true` hacia RDS; permite MITM a la base de datos. | A02 Crypto | 8/10 |

## Plan de mitigación

### Fase 1 – Urgente (días)
1. **Secreto JWT**
   - Quitar el valor por defecto de `appsettings.json` y de `docker-compose.yml`.
   - La app debe fallar al arrancar si falta `SECRET_KEY` o tiene menos de 32 bytes.
   - Usar un gestor de secretos (AWS Secrets Manager o variables de entorno).
   - **Rotar la clave actual** e invalidar los refresh tokens existentes.
2. **Registro público**
   - Deshabilitar `/signup` o protegerlo con `RequireAuthorization` de rol Admin, invitación o aprobación.
   - Cambiar `Active = true` por un flujo de activación.
3. **TLS**
   - Poner un terminador HTTPS (ALB, Nginx o Caddy) delante.
   - No publicar los puertos de API (8080), KrakenD ni frontend.
   - Usar URLs `https://` y `COOKIE_SECURE=true`.
   - Añadir HSTS.

### Fase 2 – Corto plazo (1-2 semanas)
4. **Autorización por roles y políticas**
   - Definir roles `Admin` y `Agente`.
   - Aplicar `RequireAuthorization("policy")` por grupo de rutas.
   - Comprobar la propiedad del recurso en los handlers.
   - Añadir tests de autorización.
5. **Base de datos**
   - Cambiar a `SSL Mode=VerifyFull`.
   - Instalar el bundle de CA de RDS en la imagen.

### Fase 3 – Hardening (A04, A05, A06, A08, A09, A10)
6. Limitar CORS al dominio real, añadir cabeceras de seguridad (CSP, X-Frame-Options, nosniff) y rate limiting en login/signup con bloqueo por intentos fallidos.
7. Ejecutar `dotnet list package --vulnerable` y `npm audit` en CI; añadir Dependabot.
8. Logging estructurado de eventos de autenticación y accesos denegados, sin PII ni tokens.
9. Contenedores con usuario no root, `.env` fuera del repositorio y escaneo de secretos (gitleaks) en CI.

## Alcance y pendientes
La revisión se centró en autenticación, configuración y despliegue. Queda pendiente una segunda pasada sobre inyección, validadores, dependencias y el frontend.
