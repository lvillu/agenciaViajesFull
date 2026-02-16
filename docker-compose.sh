#!/bin/bash
# Script Bash para ejecutar Docker Compose con archivo .env.development.local
# Uso: ./docker-compose.sh (ejecuta 'up -d' por defecto)
#      ./docker-compose.sh up -d
#      ./docker-compose.sh down
#      ./docker-compose.sh logs -f

ENV_FILE=".env.development.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: No se encontró el archivo '$ENV_FILE'"
    echo "Por favor, asegúrate de que '$ENV_FILE' existe en la raíz del proyecto"
    exit 1
fi

# Si no hay argumentos, usar 'up -d' por defecto
if [ "$#" -eq 0 ]; then
    ARGS="up -d"
elif [ "$1" = "up" ] && [[ " $@ " != *" -d "* ]]; then
    # Si el primer argumento es 'up' y no se especifica -d, agregarlo
    ARGS="up -d ${@:2}"
else
    ARGS="$@"
fi

echo "Ejecutando Docker Compose con archivo: $ENV_FILE"
echo "Comando: docker-compose --env-file $ENV_FILE $ARGS"
echo ""

docker-compose --env-file "$ENV_FILE" $ARGS
