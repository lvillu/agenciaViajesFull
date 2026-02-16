# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Restaurar dependencias primero (aprovecha el cache)
COPY agenciaViajes.Api/agenciaViajes.Api.csproj agenciaViajes.Api/
COPY agenciaViajes.Application/agenciaViajes.Application.csproj agenciaViajes.Application/

RUN dotnet restore agenciaViajes.Api/agenciaViajes.Api.csproj

# Copiar código fuente
COPY . .

# Compilar
RUN dotnet build agenciaViajes.Api/agenciaViajes.Api.csproj -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish

RUN dotnet publish agenciaViajes.Api/agenciaViajes.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=publish /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "agenciaViajes.Api.dll"]
