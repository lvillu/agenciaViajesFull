# ============================================================
# Multi-stage build optimizado para AWS EC2
# Usa alpine variants → imagen final ~100MB vs ~220MB
# ============================================================

# ---- Etapa 1: Restore (cacheada) ----
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS restore

WORKDIR /src

# Solo copiar .csproj para aprovechar cache de capas de Docker
COPY agenciaViajes.Api/agenciaViajes.Api.csproj agenciaViajes.Api/
COPY agenciaViajes.Application/agenciaViajes.Application.csproj agenciaViajes.Application/

RUN dotnet restore agenciaViajes.Api/agenciaViajes.Api.csproj \
    --runtime linux-musl-x64

# ---- Etapa 2: Publish ----
FROM restore AS publish

# Copiar código fuente
COPY . .

# Publicar en un solo paso (no necesita build separado)
RUN dotnet publish agenciaViajes.Api/agenciaViajes.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    --runtime linux-musl-x64 \
    --self-contained false \
    /p:UseAppHost=false

# ---- Etapa 3: Runtime (imagen mínima) ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime

# Instalar solo lo necesario (wget para healthcheck, icu para globalización)
RUN apk add --no-cache wget icu-libs

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copiar artefactos publicados
COPY --from=publish --chown=appuser:appgroup /app/publish .

USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Healthcheck con wget (curl no está en alpine)
# Se usa -qO- en lugar de --spider porque MinimalAPIs solo acepta GET (no HEAD)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/health > /dev/null || exit 1

ENTRYPOINT ["dotnet", "agenciaViajes.Api.dll"]
