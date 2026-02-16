# Script PowerShell para ejecutar Docker Compose con archivo .env.development.local
# Uso: .\docker-compose.ps1 (ejecuta 'up -d' por defecto)
#      .\docker-compose.ps1 up -d
#      .\docker-compose.ps1 down
#      .\docker-compose.ps1 logs -f

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

$envFile = ".env.development.local"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: No se encontró el archivo '$envFile'" -ForegroundColor Red
    Write-Host "Por favor, asegúrate de que '$envFile' existe en la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Si no hay argumentos, usar 'up -d' por defecto
if ($Arguments.Count -eq 0) {
    $Arguments = @("up", "-d")
} elseif ($Arguments[0] -eq "up" -and $Arguments -notcontains "-d") {
    # Si el primer argumento es 'up' y no se especifica -d, agregarlo
    $Arguments = @("up", "-d") + $Arguments[1..($Arguments.Count - 1)]
}

Write-Host "Ejecutando Docker Compose con archivo: $envFile" -ForegroundColor Green
Write-Host "Comando: docker-compose --env-file $envFile $($Arguments -join ' ')`n" -ForegroundColor Cyan

& docker-compose --env-file $envFile @Arguments
