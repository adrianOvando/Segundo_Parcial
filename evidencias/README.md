# Carpeta de Evidencias — Segundo Examen Parcial (COM610)

Esta carpeta contiene las capturas de pantalla que respaldan la configuración, pruebas y despliegue del examen práctico.

> **Importante:** Por seguridad, asegúrate de ocultar contraseñas, tokens y claves privadas en todas las capturas.

---

## Lista de Verificación de Evidencias (Checklist)

| N° | Nombre sugerido de captura | Descripción de la evidencia | Criterio evaluado |
|:---|:---|:---|:---|
| **01** | `01_ec2_instancia_sg.png` | Instancia EC2 en ejecución y reglas de entrada de su Grupo de Seguridad (SSH 22 solo desde IP pública, HTTP 80 desde 0.0.0.0/0). | EC2 y Security Groups |
| **02** | `02_rds_acceso_privado_sg.png` | Instancia RDS con **Acceso público: No** y Grupo de Seguridad permitiendo puerto 3306 **únicamente desde el grupo de EC2**. | RDS y Seguridad de Red |
| **03** | `03_rds_tabla_libros_persistencia.png` | Consulta SQL (`SELECT * FROM libros;`) en MariaDB/MySQL demostrando la existencia de la tabla y los datos persistidos en RDS. | Modelo SQL y Persistencia |
| **04** | `04_nginx_proxy_inverso_80.png` | Configuración de Nginx en `/etc/nginx/sites-available/default` y verificación de `systemctl status nginx`. | Proxy Nginx |
| **05** | `05_curl_health.png` | Petición `GET /health` a la IP pública de EC2 en puerto 80 respondiendo `200 OK` con JSON del estado del servicio. | Health Check |
| **06** | `06_postman_get_libros.png` | Petición `GET /libros` retornando la lista completa de libros almacenados en RDS. | Endpoint GET |
| **07** | `07_postman_post_libro_201.png` | Petición `POST /libros` creando un nuevo libro con datos válidos (`201 Created`). | Creación válida |
| **08** | `08_postman_post_invalido_400.png` | Petición `POST /libros` con datos faltantes o inválidos (título vacío o año no entero) respondiendo `400 Bad Request`. | Validación de datos |
| **09** | `09_postman_put_libro_200.png` | Petición `PUT /libros/:id` actualizando un registro existente (`200 OK`). | Actualización válida |
| **10** | `10_postman_get_404_inexistente.png` | Petición `GET /libros/999` a un ID inexistente respondiendo `404 Not Found`. | Manejo de 404 |
| **11** | `11_postman_delete_libro_200.png` | Petición `DELETE /libros/:id` eliminando un libro existente (`200 OK`). | Eliminación válida |
| **12** | `12_rds_persistencia_post_crud.png` | Consulta SQL en RDS confirmando que las operaciones de creación, edición y borrado impactaron la base de datos real. | Persistencia confirmada |
| **13** | `13_pruebas_jest_supertest.png` | Ejecución exitosa de `npm test` en local / consola mostrando todas las pruebas pasando (Jest & Supertest con doble de prueba). | Pruebas Automatizadas |
| **14** | `14_docker_build_local.png` | Construcción de la imagen Docker en local (`docker build -t libros-api .`) y ejecución en contenedor respondiendo `/health`. | Dockerfile e imagen |
| **15** | `15_dockerhub_imagen_sha.png` | Imagen subida a Docker Hub etiquetada con el SHA del commit (`libros-api:<sha>` y `libros-api:latest`). | Registro de Contenedores |
| **16** | `16_github_actions_secrets.png` | Configuración de los Secrets en GitHub (`DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`). | Configuración de Secretos |
| **17** | `17_github_actions_ci_exitoso.png` | Ejecución exitosa del workflow de CI (`ci.yml`) en GitHub Actions para push/PR. | CI Automatizado |
| **18** | `18_github_actions_cd_exitoso.png` | Ejecución exitosa del workflow de CD (`cd.yml`) con las 3 etapas (test, build-and-push, deploy). | CD Automatizado |
| **19** | `19_despliegue_verificacion_version.png` | Respuesta de `GET /health` y `GET /libros` tras el despliegue automático demostrando el cambio de versión o commit SHA. | Verificación de Despliegue |
