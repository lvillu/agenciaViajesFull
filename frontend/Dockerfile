# ============================================================
# Multi-stage build optimizado para AWS EC2
# Usa Next.js standalone output → imagen final ~80MB vs ~300MB
# ============================================================

# ---- Etapa 1: Instalar dependencias (cacheada) ----
FROM node:22-alpine AS deps

WORKDIR /app

# Solo copiar manifiestos para aprovechar cache de capas
COPY package.json package-lock.json* ./

# Actualizar npm a v11 para consistencia con el lockfile generado localmente
RUN npm install -g npm@^11

# Instalar dependencias con cache mount para acelerar rebuilds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# ---- Etapa 2: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias desde etapa anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para optimizar el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# NEXT_PUBLIC_* vars se hornean en el bundle al compilar, deben venir como ARG
ARG NEXT_PUBLIC_API_URL=http://localhost:5050
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ---- Etapa 3: Production (imagen mínima) ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar SOLO lo necesario del standalone build
# (no necesita node_modules completo, Next.js incluye solo lo usado)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El standalone server es un simple server.js (~80MB total vs ~300MB)
CMD ["node", "server.js"]
