# E2E — Agencia Viajes (SaaS multi-tenant)

Scripts PowerShell 7+ que validan el sistema levantado vía API Gateway.
Se crean usuarios con sufijo de timestamp: son **re-ejecutables** sin limpiar la BD.

## Prerrequisitos

1. Variable `SECRET_KEY` (mínimo 64 caracteres):
   ```powershell
   $env:SECRET_KEY = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
   ```
2. Stack arriba: `docker compose up -d --build database api krakend`
3. Gateway sano: `http://localhost:5050/health`

## Scripts

| Script | Qué valida | Tarda aprox. |
|--------|------------|--------------|
| `e2e-saas.ps1` | **Principal (64 checks).** 2 tenants, 3 proveedores c/u, 5 ventas, folios por cuenta, AgencyInfo aislada, subcuenta + owner-only, listados propios, cross-tenant prohibido (leer/editar/borrar/pagar), dashboard aislado, 401 sin token, paginación | ~1 min |
| `e2e-fase2-auth.ps1` | Login body sin `refreshToken`, timing existente vs inexistente (< 200 ms), rate limiting (35 intentos → 429s con envelope) | ~30 s |
| `e2e-fase3-seed.ps1` | Seed de 200 ventas + medición `/Sale` (p1x20/p10x20/p1x100) y charts con/sin cache | ~1 min |
| `e2e-fase4-race.ps1` | 10 pagos concurrentes a una venta → 10 folios únicos, cero 500s | ~20 s |

## Notas

- **Rate limiting (30 req/min por IP):** los scripts hacen pocas llamadas auth, pero no corras `e2e-saas.ps1` dos veces dentro del mismo minuto si antes hubo logins (espera 65 s entre corridas).
- Los tests crean datos reales en la BD del volumen `postgres_data`. Para partir de cero: `docker compose down -v` (las 11+ migraciones se aplican solas al arrancar).
- Salida: líneas `PASS/FAIL` + `RESULTADO: X pass, Y fail` (exit code 1 si hay fallos).
