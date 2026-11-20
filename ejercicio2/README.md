# Ejercicio 2 — Tema 5: CI/CD para la API del Ejercicio 1 (50 puntos)

**Segundo Examen Parcial — Trabajando en la Nube (COM610)**  
**Universidad San Francisco Xavier de Chuquisaca**  
**Docente:** Ing. Marcelo Quispe Ortega  
**Estudiante:** Jesús Adrián Ovando  

---

## 1. Descripción del Ejercicio

Este ejercicio implementa una **tubería completa de Integración Continua (CI) y Despliegue Continuo (CD)** mediante **GitHub Actions** para la API REST del catálogo de libros:

1. **Pruebas Automatizadas (Jest + Supertest):** Suite de pruebas que se ejecuta sin requerir una instancia RDS real, utilizando dobles de prueba (mocks) en la capa de datos.
2. **Contenedorización (Docker):** Empaquetado de la aplicación en una imagen optimizada basada en Alpine Linux, que recibe la configuración de RDS vía variables de entorno.
3. **Flujo de CI (`ci.yml`):** Ejecución de `npm ci` y `npm test` ante cada `push` y `pull_request` a la rama principal `main`.
4. **Flujo de CD (`cd.yml`):** Tubería con 3 trabajos dependientes (`test` -> `build-and-push` -> `deploy`):
   - Ejecuta las pruebas.
   - Construye y publica la imagen en Docker Hub etiquetada con el **commit SHA** (`${{ github.sha }}`) y `latest`.
   - Se conecta por SSH a la instancia EC2 y realiza un **despliegue seguro con verificación de salud y rollback automático**.

---

## 2. Diagrama de la Tubería CI/CD

```mermaid
flowchart TD
    subgraph GitHub ["GitHub Repository (main)"]
        Commit["Git Push / Merge a main"] --> ActionCI["GitHub Actions: CI / CD"]
    end

    subgraph CI_Stage ["Etapa 1: Integración Continua"]
        ActionCI --> TestJob["Job: test<br>(npm ci & npm test con Jest)"]
    end

    subgraph CD_Stage ["Etapa 2: Entrega Continua"]
        TestJob -->|Si pruebas pasan| BuildJob["Job: build-and-push<br>(Docker Buildx)"]
        BuildJob --> DockerHub["Docker Hub Registry<br>usuario/libros-api:SHA"]
    end

    subgraph Deploy_Stage ["Etapa 3: Despliegue en EC2"]
        DockerHub -->|Pull de Imagen| DeployJob["Job: deploy (appleboy/ssh-action)"]
        DeployJob --> ValContainer["Contenedor de Validación<br>(127.0.0.1:3001)"]
        ValContainer --> HealthCheck{"Verificación /health<br>& GET /libros"}
        HealthCheck -->|Exitoso| Swap["Swap Contenedores:<br>Promoción a 127.0.0.1:3000"]
        HealthCheck -->|Fallido| Rollback["Rollback Inmediato:<br>Se aborta y conserva versión previa"]
        Swap --> NginxProxy["Nginx (Puerto 80)<br>Tráfico Público"]
    end
```

---

## 3. Pruebas Automatizadas sin Dependencia de RDS Real

Las pruebas están implementadas en [`tests/libro.test.js`](./tests/libro.test.js) con **Jest** y **Supertest**. 

Para cumplir con el requisito de ejecutarse sin conexión a una base de datos RDS externa:
- Se implementó un **doble de prueba (mock)** de la capa de datos (`libroModel`), interceptando las consultas y respondiendo de forma determinística en milisegundos.
- Se comprueban:
  - `GET /health`: Respuesta 200 con payload de estado y versión.
  - `GET /libros`: Listado exitoso y manejo de error 500.
  - `POST /libros`: Creación válida (201) y rechazo de campos inválidos o vacíos (400).
  - `GET /libros/:id`: Búsqueda de libro existente (200) y respuesta 404 para no encontrados.
  - `PUT /libros/:id`: Actualización correcta (200), validación (400) y no encontrado (404).
  - `DELETE /libros/:id`: Eliminación exitosa (200) y no encontrado (404).

### Ejecución de pruebas en local:
```bash
# Ejecutar suite de pruebas
npm test

# Ejecutar con reporte de cobertura
npm run test:coverage
```

---

## 4. Imagen Docker y Dockerfile

El archivo [`Dockerfile`](./Dockerfile) utiliza una compilación multietapa:
- **Etapa 1 (builder):** Descarga e instala únicamente dependencias de producción.
- **Etapa 2 (runtime):** Imagen limpia con `node:20-alpine`, ejecutada bajo el usuario no root `node` y exponiendo el puerto 3000.

### Probar la imagen Docker en local:
```bash
# Construir la imagen
docker build -t libros-api:local .

# Ejecutar contenedor pasando variables
docker run -d --name libros-api -p 3000:3000 libros-api:local

# Verificar endpoint de salud
curl -i http://localhost:3000/health

# Detener contenedor
docker rm -f libros-api
```

---

## 5. Secretos de GitHub Actions (GitHub Secrets)

Para habilitar la tubería CD, configura los siguientes secretos en tu repositorio de GitHub (**Settings > Secrets and variables > Actions > New repository secret**):

| Nombre del Secret | Descripción | Ejemplo de Valor |
|:---|:---|:---|
| `DOCKER_USERNAME` | Usuario de Docker Hub | `adrianovando` |
| `DOCKER_PASSWORD` | Access Token o contraseña de Docker Hub | `dckr_pat_xxxxxxxxxxxx` |
| `SSH_HOST` | Dirección IP pública de la instancia EC2 | `3.14.xxx.xxx` |
| `SSH_USER` | Usuario de conexión SSH en EC2 | `ubuntu` (o `ec2-user`) |
| `SSH_PRIVATE_KEY` | Contenido de la clave privada SSH (`.pem`) | `-----BEGIN RSA PRIVATE KEY----- ...` |

> **Seguridad:** En EC2, el archivo con las credenciales de RDS se almacena en `/home/ubuntu/.env`. El repositorio y la imagen Docker **nunca** contienen las contraseñas de la base de datos.

---

## 6. Verificación de Despliegue y Mecanismo de Rollback

El trabajo `deploy` en `.github/workflows/cd.yml` implementa una estrategia de despliegue con validación preventiva:

1. Descarga la imagen Docker identificada con el commit SHA: `${{ secrets.DOCKER_USERNAME }}/libros-api:${{ github.sha }}`.
2. Inicia un contenedor temporal en `127.0.0.1:3001` con las variables de `/home/ubuntu/.env`.
3. Ejecuta peticiones de validación a `http://127.0.0.1:3001/health` y `http://127.0.0.1:3001/libros`.
4. **Si ambas responden 200 OK:** Se promueve la imagen al puerto de producción `127.0.0.1:3000` conectado a Nginx.
5. **Si falla alguna comprobación:** El contenedor temporal se destruye inmediatamente, el workflow finaliza con error (`exit 1`) y la versión anterior continúa en producción sin interrupciones.

### Demostrar cambio visible de versión:
Para evidenciar el despliegue exitoso exigido en la rúbrica, puedes actualizar el campo `version` en `package.json` o modificar `process.env.APP_VERSION`:
```bash
# Ejemplo: cambiar versión a 1.1.0 y hacer push
git commit -am "feat: actualizacion a version 1.1.0"
git push origin main
```
Luego verifica:
```bash
curl http://<EC2_PUBLIC_IP>/health
```
Respuesta esperada:
```json
{
  "status": "ok",
  "service": "API Catálogo de Libros",
  "version": "1.1.0",
  "uptime": 15.2,
  "timestamp": "2026-11-19T22:00:00.000Z"
}
```
