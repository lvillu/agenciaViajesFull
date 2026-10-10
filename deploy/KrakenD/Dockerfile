# Imagen oficial de KrakenD (~55MB, basada en Alpine)
# Pinear versión para builds reproducibles
FROM krakend:2.13.10

# Copiar configuración
COPY krakend.json /etc/krakend/krakend.json

EXPOSE 8080

# Validar configuración antes de arrancar
CMD ["krakend", "run", "-dc", "/etc/krakend/krakend.json"]
