# Segundo Examen Parcial — Trabajo en la Nube (COM610)

**Universidad San Francisco Xavier de Chuquisaca**  
**Facultad de Tecnologia — Carrera de Ingenieria de Sistemas**  
**Docente:** Ing. Marcelo Quispe Ortega  
**Estudiante:** Jesus Adrian Ovando  
**Semestre:** 2/2026  

---

## Informe completo

El informe con todas las evidencias, capturas y descripcion detallada de ambos ejercicios esta disponible en:

[INFORME.md](https://github.com/adrianOvando/Segundo_Parcial/blob/main/INFORME.md)

---

## Contexto del proyecto

Este repositorio contiene la solucion al segundo examen parcial de la materia Trabajando en la Nube. El examen tiene dos ejercicios que comparten la misma infraestructura en AWS.

**Ejercicio 1 (50 puntos):** Implementar una API REST de catalogo de libros con Node.js y Express, desplegada en una instancia EC2 de Amazon con una base de datos MySQL 8.4 en Amazon RDS. La API expone operaciones CRUD completas y queda accesible a traves de Nginx como proxy inverso en el puerto 80.

**Ejercicio 2 (50 puntos):** Automatizar las pruebas, la construccion de una imagen Docker y el despliegue de esa misma API sobre la misma instancia EC2, utilizando GitHub Actions con dos workflows: uno de integracion continua (CI) y uno de despliegue continuo (CD).

---

## Nota importante sobre el Ejercicio 1

El Ejercicio 1 fue desplegado inicialmente con PM2 (`pm2 start src/server.js`). Al completar el Ejercicio 2, el contenedor Docker generado por el pipeline CD reemplazo al proceso PM2. La API sigue respondiendo en la misma URL publica mediante Nginx, que ahora proxea al contenedor Docker en `127.0.0.1:3000`.

Esto significa que el docente puede verificar el Ejercicio 1 y el Ejercicio 2 en la misma URL, ya que el contenedor Docker corre exactamente el mismo codigo de la API.

---

## Como verificar el despliegue

La API esta corriendo en la instancia EC2 con IP publica `18.213.236.16`. Los siguientes comandos permiten verificar su funcionamiento:

```bash
# Estado de la API (version activa)
curl http://18.213.236.16/health

# Listar todos los libros desde RDS
curl http://18.213.236.16/libros

# Obtener un libro por ID
curl http://18.213.236.16/libros/2

# Crear un libro nuevo
curl -X POST http://18.213.236.16/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Cien anos de soledad","autor":"Gabriel Garcia Marquez","anio_publicacion":1967}'

# Actualizar un libro
curl -X PUT http://18.213.236.16/libros/2 \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Don Quijote (Edicion Clasica)","autor":"Miguel de Cervantes","anio_publicacion":1605}'

# Eliminar un libro
curl -X DELETE http://18.213.236.16/libros/2

# Validacion: datos invalidos (retorna 400)
curl -X POST http://18.213.236.16/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"","autor":"Alguien","anio_publicacion":"no es numero"}'

# Validacion: ID inexistente (retorna 404)
curl http://18.213.236.16/libros/9999
```

Los workflows de GitHub Actions se pueden revisar en:

- CI: https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/ci.yml
- CD: https://github.com/adrianOvando/Segundo_Parcial/actions/workflows/cd.yml

---

## Ejecutar localmente

```bash
git clone https://github.com/adrianOvando/Segundo_Parcial.git
cd Segundo_Parcial

npm install

cp .env.example .env
# Editar .env con las credenciales reales de una instancia RDS

node src/server.js
```

## Ejecutar las pruebas

Las pruebas corren sin conexion a RDS gracias a un mock de la capa de datos con `jest.mock()`.

```bash
npm test
npm run test:coverage
```

---

## Estructura del repositorio

```
.github/workflows/
    ci.yml              Workflow CI: ejecuta npm ci y npm test en cada push y pull_request a main
    cd.yml              Workflow CD: test + build de imagen Docker + despliegue en EC2
src/
    app.js              Configuracion de Express, middlewares y rutas (exportado sin listen)
    server.js           Importa app y llama a listen en el puerto 3000
    config/db.js        Pool de conexiones MySQL2 a Amazon RDS
    controllers/        Logica de negocio y validacion de datos
    models/             Consultas SQL parametrizadas
    routes/             Definicion de rutas
tests/
    libro.test.js       34 pruebas con Jest y Supertest
evidencias/             Capturas de evidencia organizadas y renombradas
ejercicio1/             Copia del codigo y configuracion para el Ejercicio 1
ejercicio2/             Copia del codigo y configuracion para el Ejercicio 2
Dockerfile              Imagen Docker en dos etapas, node:20-alpine, usuario no-root
db.sql                  Script SQL: crea libros_db y la tabla libros con datos iniciales
nginx.conf              Configuracion de Nginx como proxy inverso en el puerto 80
.env.example            Plantilla de variables de entorno sin credenciales reales
INFORME.md              Informe completo del segundo examen parcial
```

---

## Endpoints disponibles

| Metodo | Ruta | Descripcion | Respuesta exitosa |
|---|---|---|---|
| GET | /health | Estado del servicio y version | 200 |
| GET | /libros | Listar todos los libros | 200 |
| GET | /libros/:id | Obtener un libro por ID | 200 / 404 |
| POST | /libros | Crear un libro nuevo | 201 / 400 |
| PUT | /libros/:id | Actualizar un libro existente | 200 / 400 / 404 |
| DELETE | /libros/:id | Eliminar un libro | 200 / 404 |

---

## Recursos de AWS utilizados

| Recurso | Identificador | Tipo | Region |
|---|---|---|---|
| EC2 | SegundoParcial | t3.micro Ubuntu 26.04 | us-east-1c |
| RDS | rds-jao-libros | MySQL 8.4 db.t4g.micro | us-east-1b |
| VPC | vpc-032109f9980f630a4 | VPC por defecto | us-east-1 |
| Registro de contenedores | ghcr.io/adrianovando/segundo_parcial/libros-api | GHCR | — |
