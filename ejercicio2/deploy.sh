#!/bin/bash
# ==========================================================
# Script de Despliegue Automatizado con Verificación y Rollback
# Segundo Parcial COM610 - Ejercicio 2
# ==========================================================
set -e

# Parámetros recibidos o variables de entorno
IMAGE_NAME="${1:-$IMAGE}"
ENV_FILE="${2:-$HOME/.env}"
CONTAINER_PROD="libros-api"
CONTAINER_VALIDATION="libros-api-val"
PORT_PROD="3000"
PORT_VAL="3001"

if [ -z "$IMAGE_NAME" ]; then
  echo "Error: Debe especificar el nombre y tag de la imagen Docker."
  echo "Uso: ./deploy.sh <nombre_imagen:tag> [ruta_archivo_env]"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Advertencia: Archivo de variables de entorno $ENV_FILE no encontrado."
  echo "Se intentará continuar si las variables ya están en el sistema o se creará uno por defecto."
fi

echo "=========================================================="
echo "Iniciando Despliegue Seguro para: $IMAGE_NAME"
echo "=========================================================="

# 1. Descargar la nueva imagen de Docker Hub
echo "[Paso 1/5] Descargando imagen Docker: $IMAGE_NAME..."
docker pull "$IMAGE_NAME"

# 2. Desplegar contenedor temporal en puerto 3001 (enlazado solo a 127.0.0.1)
echo "[Paso 2/5] Levantando contenedor de validación en 127.0.0.1:$PORT_VAL..."
docker rm -f "$CONTAINER_VALIDATION" 2>/dev/null || true

if [ -f "$ENV_FILE" ]; then
  docker run -d \
    --name "$CONTAINER_VALIDATION" \
    --env-file "$ENV_FILE" \
    -p 127.0.0.1:$PORT_VAL:3000 \
    "$IMAGE_NAME"
else
  docker run -d \
    --name "$CONTAINER_VALIDATION" \
    -p 127.0.0.1:$PORT_VAL:3000 \
    "$IMAGE_NAME"
fi

# 3. Esperar que el contenedor inicie y estabilice
echo "[Paso 3/5] Esperando inicialización del servicio..."
sleep 6

# 4. Verificación de salud y persistencia (Healthcheck + GET /libros)
echo "[Paso 4/5] Ejecutando pruebas de verificación (Healthcheck & /libros)..."
VERIFIED=0
for i in {1..5}; do
  if curl -sf "http://127.0.0.1:$PORT_VAL/health" > /dev/null && \
     curl -sf "http://127.0.0.1:$PORT_VAL/libros" > /dev/null; then
    echo ">> Comprobación exitosa en el intento $i: /health y /libros respondieron 200 OK."
    VERIFIED=1
    break
  fi
  echo "Reintentando verificación ($i/5)..."
  sleep 3
done

if [ "$VERIFIED" -ne 1 ]; then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "FALLO EN LA VERIFICACIÓN DE LA NUEVA VERSIÓN."
  echo "El contenedor de validación no superó las comprobaciones."
  echo "Cancelando despliegue y preservando la versión en producción."
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  docker rm -f "$CONTAINER_VALIDATION" 2>/dev/null || true
  exit 1
fi

# 5. Promoción a Producción (Swap de Contenedores)
echo "[Paso 5/5] Promoviendo a producción en 127.0.0.1:$PORT_PROD (Proxy Nginx)..."
# Detener y eliminar contenedor temporal de validación
docker rm -f "$CONTAINER_VALIDATION" 2>/dev/null || true

# Reemplazar contenedor de producción
docker stop "$CONTAINER_PROD" 2>/dev/null || true
docker rm "$CONTAINER_PROD" 2>/dev/null || true

if [ -f "$ENV_FILE" ]; then
  docker run -d \
    --name "$CONTAINER_PROD" \
    --restart unless-stopped \
    --env-file "$ENV_FILE" \
    -p 127.0.0.1:$PORT_PROD:3000 \
    "$IMAGE_NAME"
else
  docker run -d \
    --name "$CONTAINER_PROD" \
    --restart unless-stopped \
    -p 127.0.0.1:$PORT_PROD:3000 \
    "$IMAGE_NAME"
fi

# Esperar estabilización final
sleep 3

# Verificación post-despliegue en producción
echo "Verificando endpoint público localmente..."
curl -s "http://127.0.0.1:$PORT_PROD/health" | grep -q "ok"
echo ""
echo "=========================================================="
echo "DESPLIEGUE FINALIZADO EXITOSAMENTE"
echo "Imagen activa: $IMAGE_NAME"
echo "=========================================================="

# Limpieza preventiva de imágenes sin uso
docker system prune -f 2>/dev/null || true
