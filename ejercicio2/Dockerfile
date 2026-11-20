# ==========================================================
# Dockerfile - API REST Catálogo de Libros (Ejercicio 2)
# ==========================================================

# Etapa 1: Dependencias de producción
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Etapa 2: Imagen de ejecución (Runtime)
FROM node:20-alpine

WORKDIR /app

LABEL maintainer="Adrian Ovando"
LABEL description="API REST Catálogo de Libros - Segundo Parcial COM610"

# Copiar dependencias y código fuente
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Variables de entorno por defecto
ENV PORT=3000 \
    NODE_ENV=production

# Exponer puerto interno del servicio
EXPOSE 3000

# Ejecutar como usuario no privilegiado para mayor seguridad
USER node

# Comando de inicio del servidor
CMD ["node", "src/server.js"]
