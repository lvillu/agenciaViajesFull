#!/bin/bash
# Script Bash para ejecutar Docker Compose con archivo .env.development.local
# Uso: ./docker-compose.sh (ejecuta 'up -d' por defecto)
#      ./docker-compose.sh up -d
#      ./docker-compose.sh down
#      ./docker-compose.sh logs -f

ENV_FILE=".env.development.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "\033[0;31mError: No se encontró el archivo '$ENV_FILE'\033[0m"
    echo -e "\033[0;33mPor favor, asegúrate de que '$ENV_FILE' existe en la raíz del proyecto\033[0m"
    exit 1
fi

# Si no hay argumentos, usar 'up -d' por defecto
IS_UP_COMMAND=false
if [ "$#" -eq 0 ]; then
    ARGS="up -d"
    IS_UP_COMMAND=true
elif [ "$1" = "up" ]; then
    IS_UP_COMMAND=true
    if [[ " $@ " != *" -d "* ]]; then
        # Si el primer argumento es 'up' y no se especifica -d, agregarlo
        ARGS="up -d ${@:2}"
    else
        ARGS="$@"
    fi
else
    ARGS="$@"
fi

echo -e "\033[0;32mEjecutando Docker Compose con archivo: $ENV_FILE\033[0m"
echo -e "\033[0;36mComando: docker-compose --env-file $ENV_FILE $ARGS\033[0m"
echo ""

docker-compose --env-file "$ENV_FILE" $ARGS

# Si es un comando 'up', esperar a que las migraciones se apliquen
if [ "$IS_UP_COMMAND" = true ] && [ $? -eq 0 ]; then
    echo -e "\n\033[0;33m⏳ Esperando a que los servicios se inicien y las migraciones se apliquen...\033[0m"
    
    # Esperar a que el contenedor de la API esté listo (máximo 60 segundos)
    MAX_ATTEMPTS=30
    ATTEMPT=0
    API_READY=false
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ "$API_READY" = false ]; do
        sleep 2
        ATTEMPT=$((ATTEMPT + 1))
        
        # Verificar si el contenedor está en ejecución
        CONTAINER_STATUS=$(docker inspect -f '{{.State.Running}}' agencia_viajes_api 2>/dev/null)
        
        if [ "$CONTAINER_STATUS" = "true" ]; then
            # Verificar los logs para confirmar que las migraciones se aplicaron
            LOGS=$(docker logs agencia_viajes_api 2>&1)
            
            if echo "$LOGS" | grep -q "\[OK\] Migraciones aplicadas correctamente"; then
                API_READY=true
                echo -e "\n\033[0;32m✅ ¡Servicios iniciados correctamente!\033[0m"
                echo -e "\033[0;32m✅ Migraciones de base de datos aplicadas exitosamente\033[0m"
                echo -e "\n\033[0;36m📋 Estado de los servicios:\033[0m"
                docker-compose --env-file "$ENV_FILE" ps
            elif echo "$LOGS" | grep -q "\[ERROR\] Error al aplicar migraciones"; then
                echo -e "\n\033[0;31m❌ Error al aplicar las migraciones\033[0m"
                echo -e "\033[0;33mVer logs completos con: docker logs agencia_viajes_api\033[0m"
                exit 1
            fi
        fi
        
        echo -n "."
    done
    
    if [ "$API_READY" = false ]; then
        echo -e "\n\033[0;33m⚠️  Timeout esperando las migraciones. Verifica los logs:\033[0m"
        echo -e "\033[0;36m   docker logs agencia_viajes_api\033[0m"
    fi
fi
