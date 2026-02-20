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
$isUpCommand = $false
if ($Arguments.Count -eq 0) {
    $Arguments = @("up", "-d")
    $isUpCommand = $true
} elseif ($Arguments[0] -eq "up") {
    $isUpCommand = $true
    if ($Arguments -notcontains "-d") {
        # Si el primer argumento es 'up' y no se especifica -d, agregarlo
        $Arguments = @("up", "-d") + $Arguments[1..($Arguments.Count - 1)]
    }
}

Write-Host "Ejecutando Docker Compose con archivo: $envFile" -ForegroundColor Green
Write-Host "Comando: docker-compose --env-file $envFile $($Arguments -join ' ')`n" -ForegroundColor Cyan

& docker-compose --env-file $envFile @Arguments

# Si es un comando 'up', esperar a que las migraciones se apliquen
if ($isUpCommand -and $LASTEXITCODE -eq 0) {
    Write-Host "`n⏳ Esperando a que los servicios se inicien y las migraciones se apliquen..." -ForegroundColor Yellow
    
    # Esperar a que el contenedor de la API esté listo (máximo 60 segundos)
    $maxAttempts = 30
    $attempt = 0
    $apiReady = $false
    
    while ($attempt -lt $maxAttempts -and -not $apiReady) {
        Start-Sleep -Seconds 2
        $attempt++
        
        # Verificar si el contenedor está en ejecución
        $containerStatus = docker inspect -f '{{.State.Running}}' agencia_viajes_api 2>$null
        
        if ($containerStatus -eq "true") {
            # Verificar los logs para confirmar que las migraciones se aplicaron
            $logs = docker logs agencia_viajes_api 2>&1
            
            if ($logs -match "\[OK\] Migraciones aplicadas correctamente") {
                $apiReady = $true
                Write-Host "`n✅ ¡Servicios iniciados correctamente!" -ForegroundColor Green
                Write-Host "✅ Migraciones de base de datos aplicadas exitosamente" -ForegroundColor Green
                Write-Host "`n📋 Estado de los servicios:" -ForegroundColor Cyan
                & docker-compose --env-file $envFile ps
            }
            elseif ($logs -match "\[ERROR\] Error al aplicar migraciones") {
                Write-Host "`n❌ Error al aplicar las migraciones" -ForegroundColor Red
                Write-Host "Ver logs completos con: docker logs agencia_viajes_api" -ForegroundColor Yellow
                exit 1
            }
        }
        
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    
    if (-not $apiReady) {
        Write-Host "`n⚠️  Timeout esperando las migraciones. Verifica los logs:" -ForegroundColor Yellow
        Write-Host "   docker logs agencia_viajes_api" -ForegroundColor Cyan
    }
}
