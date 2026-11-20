# Segundo Examen Parcial — Trabajando en la Nube (COM610)

**Universidad San Francisco Xavier de Chuquisaca**  
**Facultad de Tecnologia — Carrera de Ingenieria de Sistemas**  
**Docente:** Ing. Marcelo Quispe Ortega  
**Estudiante:** Jesus Adrian Ovando  
**Semestre:** 2/2026  

---

## Informe

El informe completo del segundo examen parcial, con evidencias, capturas y descripcion detallada de ambos ejercicios, se encuentra en:

**[INFORME.md — Ver Informe Completo](https://github.com/adrianOvando/Segundo_Parcial/blob/main/INFORME.md)**

---

## Enlaces de Verificacion

| Recurso | URL |
|---|---|
| API /health | http://18.213.236.16/health |
| API /libros | http://18.213.236.16/libros |
| CI — Integracion Continua | https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/ci.yml |
| CD — Despliegue Continuo | https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/cd.yml |
| Evidencias | [evidencias/](./evidencias/) |

---

## Estructura del Repositorio

```
├── .github/
│   └── workflows/
│       ├── ci.yml          # Workflow de Integracion Continua (Jest + Supertest)
│       └── cd.yml          # Workflow de Despliegue Continuo (Docker + EC2)
├── src/                    # Codigo fuente de la API (MVC: config, models, controllers, routes)
├── tests/                  # Pruebas automatizadas con Jest y Supertest (mocks sin RDS)
├── evidencias/             # Capturas de evidencia organizadas y renombradas
├── ejercicio1/             # Ejercicio 1: API REST en EC2 con RDS
├── ejercicio2/             # Ejercicio 2: CI/CD con GitHub Actions y Docker
├── Dockerfile              # Imagen Docker optimizada (node:20-alpine, usuario no-root)
├── db.sql                  # Script SQL: crea base de datos libros_db y tabla libros
├── nginx.conf              # Configuracion de Nginx como proxy inverso (puerto 80)
├── .env.example            # Plantilla de variables de entorno (sin credenciales reales)
├── INFORME.md              # Informe completo del segundo examen parcial
└── README.md               # Este archivo
```

---

## Endpoints de la API

| Metodo | Ruta | Descripcion | Respuesta |
|---|---|---|---|
| GET | /health | Estado del servicio | 200 OK |
| GET | /libros | Listar todos los libros | 200 OK |
| GET | /libros/:id | Obtener libro por ID | 200 / 404 |
| POST | /libros | Crear libro nuevo | 201 / 400 |
| PUT | /libros/:id | Actualizar libro | 200 / 400 / 404 |
| DELETE | /libros/:id | Eliminar libro | 200 / 404 |

---

## Ejecutar localmente

```bash
# Clonar el repositorio
git clone https://github.com/adrianOvando/Segundo_Parcial.git
cd Segundo_Parcial

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores reales de RDS

# Iniciar servidor
node src/server.js
```

## Ejecutar las pruebas

```bash
# Pruebas unitarias y de integracion (sin RDS)
npm test

# Pruebas con reporte de cobertura
npm run test:coverage
```

---

## Recursos de AWS

| Recurso | Identificador | Tipo | Region |
|---|---|---|---|
| EC2 | SegundoParcial | t3.micro Ubuntu 26.04 | us-east-1c |
| RDS | rds-jao-libros | MySQL 8.4 db.t4g.micro | us-east-1b |
| VPC | vpc-032109f9980f630a4 | VPC por defecto | us-east-1 |
| Registro de contenedores | ghcr.io/adrianovando/segundo_parcial/libros-api | GHCR | — |
