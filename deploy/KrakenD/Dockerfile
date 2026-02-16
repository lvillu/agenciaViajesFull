# Usa la imagen oficial de KrakenD
FROM krakend:latest

# Copia el archivo de configuraci�n de KrakenD
COPY krakend.json /etc/krakend/krakend.json

# Expone el puerto 5050 para acceder a KrakenD
EXPOSE 5050

# Comando para ejecutar KrakenD con la configuraci�n copiada
CMD ["krakend", "run", "-dc", "/etc/krakend/krakend.json"]
