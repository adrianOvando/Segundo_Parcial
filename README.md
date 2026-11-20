# Segundo Examen Parcial — Trabajando en la Nube (COM610)

**Universidad San Francisco Xavier de Chuquisaca**  
**Facultad de Tecnología — Carrera de Ingeniería de Sistemas**  
**Docente:** Ing. Marcelo Quispe Ortega  
**Estudiante:** Jesús Adrián Ovando  
**Semestre:** 2/2026  
**Repositorio GitHub:** [https://github.com/adrianOvando/Segundo_Parcial](https://github.com/adrianOvando/Segundo_Parcial)

---

## 📌 Enlaces Rápidos de Verificación

* **URL Pública de la API (EC2 / Nginx):** `http://<EC2_PUBLIC_IP>/health` | `http://<EC2_PUBLIC_IP>/libros`
* **Workflow de CI Exitoso (GitHub Actions):** [Ver Ejecuciones de CI](https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/ci.yml)
* **Workflow de CD Exitoso (GitHub Actions):** [Ver Ejecuciones de CD](https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/cd.yml)
* **Carpeta de Evidencias:** [`evidencias/`](./evidencias/)

---

## 📁 Estructura del Repositorio

El repositorio se encuentra estructurado en dos carpetas individuales para cada ejercicio, además de los archivos base en la raíz para ejecución directa y flujos de GitHub Actions:

```text
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Workflow de Integración Continua (pruebas)
│       └── cd.yml                 # Workflow de Despliegue Continuo (Docker + EC2)
├── ejercicio1/                    # [EJERCICIO 1] API REST en EC2 con base de datos RDS
│   ├── src/                       # Código fuente (MVC: config, models, controllers, routes)
│   ├── db.sql                     # Script SQL para crear base de datos y tabla libros en RDS
│   ├── nginx.conf                 # Configuración de Nginx como Proxy Inverso (puerto 80)
│   ├── .env.example               # Plantilla de variables de entorno ficticias
│   ├── package.json               # Dependencias de producción
│   ├── package-lock.json          # Bloqueo de dependencias
│   └── README.md                  # Documentación específica del Ejercicio 1
├── ejercicio2/                    # [EJERCICIO 2] CI/CD con GitHub Actions y Docker
│   ├── src/                       # Código fuente de la API
│   ├── tests/                     # Pruebas automatizadas Jest + Supertest (con Mock)
│   ├── Dockerfile                 # Imagen Docker optimizada (Node 20 Alpine)
│   ├── deploy.sh                  # Script de despliegue con verificación y rollback
│   ├── db.sql                     # Script SQL de respaldo
│   ├── nginx.conf                 # Configuración del proxy inverso
│   ├── .dockerignore              # Archivos excluidos del contexto Docker
│   ├── .env.example               # Plantilla de variables de entorno
│   ├── package.json               # Scripts de test, build y dependencias
│   ├── package-lock.json          # Bloqueo de dependencias
│   └── README.md                  # Documentación específica del Ejercicio 2
├── evidencias/                    # Capturas solicitadas en la rúbrica del examen
│   └── README.md                  # Lista de verificación de las 19 evidencias
├── src/                           # Código fuente raíz para GitHub Actions
├── tests/                         # Pruebas automatizadas raíz
├── Dockerfile                     # Dockerfile raíz
├── db.sql                         # Script SQL raíz
├── nginx.conf                     # Configuración Nginx raíz
├── .env.example                   # Plantilla de variables de entorno raíz
├── .gitignore                     # Exclusión de node_modules, .env, pem, logs
└── README.md                      # Documentación general y guía de evaluación
```

---

## 🏛️ Arquitectura Global del Sistema

```mermaid
flowchart TD
    subgraph DevMachine ["Equipo de Desarrollo"]
        Dev["Desarrollador"] -->|git push origin main| GitHubRepo["Repositorio GitHub<br>adrianOvando/Segundo_Parcial"]
    end

    subgraph GitHubActions ["GitHub Actions CI/CD"]
        GitHubRepo --> CIJob["Job 1: CI (npm test)<br>Jest + Supertest (Mocks)"]
        CIJob -->|Éxito| CDJob["Job 2: Docker Build & Push<br>libros-api:SHA"]
        CDJob --> CDDeploy["Job 3: Deploy via SSH<br>(appleboy/ssh-action)"]
    end

    subgraph Registry ["Docker Hub"]
        CDJob --> DockerHub["Registro Docker Hub<br>adrianovando/libros-api"]
    end

    subgraph AWSCloud ["Nube de Amazon Web Services (AWS VPC)"]
        subgraph EC2Instance ["Instancia EC2 (Linux) - ec2-libros-jo"]
            Nginx["Nginx Proxy Inverso<br>(Puerto 80 Público)"]
            CDDeploy -->|SSH (Puerto 22)| SSHDepl["Mecanismo de Despliegue<br>deploy.sh / Docker Pull"]
            DockerHub -.->|docker pull| SSHDepl
            SSHDepl --> DockerVal["Contenedor de Validación<br>(127.0.0.1:3001)"]
            DockerVal --> HealthCheck{"¿Healthcheck & /libros<br>responden 200 OK?"}
            HealthCheck -->|Sí| DockerProd["Contenedor Producción<br>(127.0.0.1:3000)"]
            HealthCheck -->|No| Rollback["Rollback Automático<br>(Conserva anterior)"]
            Nginx -->|Proxy Pass 127.0.0.1:3000| DockerProd
        end

        subgraph RDSInstance ["Amazon RDS (MariaDB / MySQL) - rds-libros-jo"]
            RDSDB[("Base de Datos: biblioteca<br>Tabla: libros<br>(Acceso Público: Deshabilitado)")]
        end

        DockerProd -->|Puerto 3306 (Seguro)| RDSDB
    end

    subgraph PublicInternet ["Internet / Clientes"]
        Client["Clientes (curl / Postman / Navegador)"] -->|HTTP Puerto 80| Nginx
    end
```

---

## ☁️ Recursos de AWS Utilizados y Configuración de Seguridad

| Recurso | Identificador | Motor / Tipo | Acceso Público | Grupo de Seguridad (SG) | Reglas de Entrada (Inbound) |
|:---|:---|:---|:---:|:---|:---|
| **VPC** | VPC por defecto o propia | VPC compartida | — | — | Misma VPC para EC2 y RDS. |
| **EC2** | `ec2-libros-jo` | Ubuntu 24.04 / Amazon Linux (t3.micro) | **Sí** (IP Elástica o Pública) | `ec2-libros-sg` | • **SSH (22):** Mi IP Pública (`xx.xx.xx.xx/32`)<br>• **HTTP (80):** Todo Internet (`0.0.0.0/0`) |
| **RDS** | `rds-libros-jo` | MariaDB / MySQL Community (db.t4g.micro o db.t3.micro) | **NO** (Acceso público deshabilitado) | `rds-libros-sg` | • **MySQL/MariaDB (3306):** Solo desde `ec2-libros-sg` (`sg-xxxxxx`) |

> 🔒 **Buenas Prácticas de Seguridad:**
> 1. Los puertos **3000** (Node.js) y **3306** (RDS) **nunca** están expuestos a Internet.
> 2. El contenedor Docker en EC2 está enlazado a `127.0.0.1:3000`, siendo accesible únicamente a través del proxy inverso Nginx en el puerto 80.
> 3. La base de datos RDS reside en subred privada sin IP pública accesible.
> 4. Los archivos confidenciales (`.env`, llaves `.pem`, tokens) están excluidos en `.gitignore` y `.dockerignore`.

---

## 🗄️ Modelo de Datos (`db.sql`)

La base de datos almacena la información de los libros en la tabla `libros`:

```sql
CREATE DATABASE IF NOT EXISTS biblioteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca;

CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  anio_publicacion INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔌 Especificación de Endpoints y Operaciones CRUD

La API implementa consultas SQL parametrizadas para evitar inyecciones SQL y valida estrictamente que `titulo` y `autor` no sean vacíos y que `anio_publicacion` sea un entero válido:

| Método | Ruta | Código HTTP | Descripción |
|:---|:---|:---:|:---|
| `GET` | `/health` | `200 OK` | Devuelve JSON con estado del servicio (`status: ok`), versión y uptime. |
| `GET` | `/libros` | `200 OK` | Devuelve la lista de libros registrados en Amazon RDS. |
| `GET` | `/libros/:id` | `200 OK` / `404 Not Found` | Devuelve un libro por su ID; responde `404` si no existe o `400` si ID es inválido. |
| `POST` | `/libros` | `201 Created` / `400 Bad Request` | Crea un libro válido; responde `201` con el registro creado. Rechaza con `400` datos vacíos o erróneos. |
| `PUT` | `/libros/:id` | `200 OK` / `400` / `404` | Actualiza un libro existente; responde `404` si no existe o `400` si los datos son inválidos. |
| `DELETE` | `/libros/:id` | `200 OK` / `404 Not Found` | Elimina un libro de RDS; responde `404` si no existe. |

---

## 🧪 Pruebas Automatizadas (Jest & Supertest)

Las pruebas están implementadas con **Jest** y **Supertest** en la carpeta `tests/`. Para garantizar que se ejecuten en cualquier entorno de CI sin requerir una instancia RDS activa, se utiliza un **doble de prueba (mock de la capa de datos)**.

Para correr las pruebas localmente:
```bash
# Instalar dependencias limpias
npm install

# Ejecutar las 17 pruebas unitarias y de integración
npm test

# Ejecutar con análisis de cobertura de código
npm run test:coverage
```

### Casos de prueba cubiertos:
1. `GET /health` responde 200 con formato JSON válido y versión activa.
2. `GET /libros` lista todos los libros almacenados (200).
3. `GET /libros` maneja errores de base de datos respondiendo 500.
4. `GET /libros/:id` obtiene un libro existente por ID (200).
5. `GET /libros/:id` responde 404 para un ID que no existe.
6. `GET /libros/:id` responde 400 cuando el parámetro ID no es numérico.
7. `POST /libros` crea un libro válido retornando 201 y los datos generados.
8. `POST /libros` rechaza con 400 cuando el título está vacío o ausente.
9. `POST /libros` rechaza con 400 cuando el autor está vacío o ausente.
10. `POST /libros` rechaza con 400 cuando el año no es un entero.
11. `POST /libros` rechaza con 400 cuando el año es un número decimal.
12. `PUT /libros/:id` actualiza los datos de un libro existente (200).
13. `PUT /libros/:id` responde 404 si el libro a actualizar no existe.
14. `PUT /libros/:id` rechaza con 400 si se envían datos inválidos.
15. `DELETE /libros/:id` elimina correctamente un libro existente (200).
16. `DELETE /libros/:id` responde 404 si el libro a eliminar no existe.
17. Manejador 404 para cualquier ruta inexistente.

---

## 🚀 Despliegue y Flujo CI/CD

### Secretos requeridos en GitHub Actions:
Ve a **Settings > Secrets and variables > Actions** y define:
- `DOCKER_USERNAME`: Tu usuario de Docker Hub.
- `DOCKER_PASSWORD`: Token de acceso de Docker Hub.
- `SSH_HOST`: IP pública de la instancia EC2.
- `SSH_USER`: Usuario SSH (`ubuntu`).
- `SSH_PRIVATE_KEY`: Contenido de tu archivo `.pem`.

### Mecanismo de Rollback en Despliegue:
El archivo `.github/workflows/cd.yml` asegura que ninguna versión rota llegue a los usuarios:
1. Inicia un contenedor con la nueva versión en el puerto `3001`.
2. Ejecuta peticiones a `http://127.0.0.1:3001/health` y `http://127.0.0.1:3001/libros`.
3. Si la verificación tiene éxito, intercambia el contenedor en producción (`127.0.0.1:3000`).
4. Si la verificación falla, destruye el contenedor de prueba, finaliza el flujo en error y mantiene la versión anterior en ejecución.

---

## 📸 Evidencias Solicitadas

Las capturas de verificación se organizan en la carpeta [`evidencias/`](./evidencias/):
- **EC2 y Security Groups:** Instancia activa y reglas de entrada SSH (22 desde IP pública) y HTTP (80).
- **RDS y Seguridad de Red:** Instancia RDS con acceso público deshabilitado y puerto 3306 restringido al grupo de EC2.
- **Persistencia en RDS:** Consultas SQL (`SELECT * FROM libros;`) mostrando los registros en la base de datos real.
- **Operaciones CRUD:** Capturas de `curl` / Postman verificando las respuestas `200`, `201`, `400` y `404`.
- **Pruebas Automatizadas:** Consola mostrando `npm test` exitoso con Jest y Supertest.
- **Docker Hub:** Imagen etiquetada con el commit SHA (`libros-api:<sha>`).
- **GitHub Actions:** Historial de ejecuciones exitosas de `CI` y `CD`.
- **Verificación de Despliegue:** Cambio de versión observable en `/health`.
