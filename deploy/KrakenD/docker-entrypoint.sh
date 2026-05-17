#!/bin/sh
# Sustituye el placeholder del CORS con la variable de entorno real
# antes de arrancar KrakenD. El placeholder "CORS_ALLOWED_ORIGIN_PLACEHOLDER"
# viene del krakend.prod.tmpl y se reemplaza en tiempo de ejecución.

CONFIG_SRC="/etc/krakend/krakend.prod.tmpl"
CONFIG_DST="/tmp/krakend.json"

if [ -z "$CORS_ALLOWED_ORIGIN" ]; then
  echo "ERROR: La variable CORS_ALLOWED_ORIGIN no está definida." >&2
  exit 1
fi

sed "s|CORS_ALLOWED_ORIGIN_PLACEHOLDER|${CORS_ALLOWED_ORIGIN}|g" \
  "$CONFIG_SRC" > "$CONFIG_DST"

echo "KrakenD CORS configurado para: ${CORS_ALLOWED_ORIGIN}"

exec krakend run -dc "$CONFIG_DST"
