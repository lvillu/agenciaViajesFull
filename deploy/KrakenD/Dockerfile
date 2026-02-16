# Imagen oficial de KrakenD (~50MB, ya basada en Alpine)
# Pinear versión para builds reproducibles
FROM devopsfaith/krakend:2.7

# Copiar configuración
COPY krakend.json /etc/krakend/krakend.json

EXPOSE 8080

# Validar configuración antes de arrancar
CMD ["krakend", "run", "-dc", "/etc/krakend/krakend.json"]
