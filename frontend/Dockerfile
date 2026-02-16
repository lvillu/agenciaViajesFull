# Multi-stage build para optimizar la imagen final

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para manejar señales correctamente
RUN apk add --no-cache dumb-init

# Copiar package.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar build desde la etapa anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para manejar signals
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar la aplicación
CMD ["npm", "start"]
