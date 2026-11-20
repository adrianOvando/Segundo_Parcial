const request = require('supertest');
const app = require('../src/app');
const libroModel = require('../src/models/libroModel');

// Doble de prueba (Test Double / Mock) para la capa de datos
// Permite ejecutar todas las pruebas automatizadas sin requerir una instancia real de RDS
jest.mock('../src/models/libroModel');

describe('Pruebas Automatizadas de la API Catálogo de Libros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('debe responder 200 y JSON indicando que el servicio está activo', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('service', 'API Catálogo de Libros');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /libros', () => {
    it('debe responder 200 y la lista de libros registrados', async () => {
      const mockLibros = [
        { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio_publicacion: 1967 },
        { id: 2, titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', anio_publicacion: 1605 }
      ];
      libroModel.getAll.mockResolvedValue(mockLibros);

      const res = await request(app).get('/libros');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].titulo).toBe('Cien años de soledad');
      expect(libroModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('debe responder 500 si la base de datos lanza un error', async () => {
      libroModel.getAll.mockRejectedValue(new Error('Fallo de conexión en RDS'));

      const res = await request(app).get('/libros');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error interno del servidor');
    });
  });

  describe('GET /libros/:id', () => {
    it('debe responder 200 con el libro solicitado si existe', async () => {
      const mockLibro = { id: 1, titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio_publicacion: 1944 };
      libroModel.getById.mockResolvedValue(mockLibro);

      const res = await request(app).get('/libros/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockLibro);
      expect(libroModel.getById).toHaveBeenCalledWith(1);
    });

    it('debe responder 404 si el libro no existe en la base de datos', async () => {
      libroModel.getById.mockResolvedValue(null);

      const res = await request(app).get('/libros/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Libro con ID 999 no encontrado');
    });

    it('debe responder 400 si el parámetro ID no es válido', async () => {
      const res = await request(app).get('/libros/abc');
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /libros', () => {
    it('debe crear un libro válido y responder 201 con el registro creado', async () => {
      const nuevoLibro = {
        titulo: 'Rayuela',
        autor: 'Julio Cortázar',
        anio_publicacion: 1963
      };
      libroModel.create.mockResolvedValue({ id: 3, ...nuevoLibro });

      const res = await request(app)
        .post('/libros')
        .send(nuevoLibro);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 3);
      expect(res.body.titulo).toBe('Rayuela');
      expect(res.body.autor).toBe('Julio Cortázar');
      expect(res.body.anio_publicacion).toBe(1963);
      expect(libroModel.create).toHaveBeenCalledWith(nuevoLibro);
    });

    it('debe rechazar con 400 cuando titulo está vacío o ausente', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: '   ', autor: 'Julio Cortázar', anio_publicacion: 1963 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(libroModel.create).not.toHaveBeenCalled();
    });

    it('debe rechazar con 400 cuando autor está vacío o ausente', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Rayuela', autor: '', anio_publicacion: 1963 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(libroModel.create).not.toHaveBeenCalled();
    });

    it('debe rechazar con 400 cuando anio_publicacion no es un entero válido', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Rayuela', autor: 'Julio Cortázar', anio_publicacion: 'mil novecientos sesenta' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(libroModel.create).not.toHaveBeenCalled();
    });

    it('debe rechazar con 400 cuando anio_publicacion es un número decimal', async () => {
      const res = await request(app)
        .post('/libros')
        .send({ titulo: 'Rayuela', autor: 'Julio Cortázar', anio_publicacion: 1963.5 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Datos de entrada inválidos');
      expect(libroModel.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /libros/:id', () => {
    it('debe actualizar un libro existente y responder 200', async () => {
      const datosActualizados = {
        titulo: 'Rayuela (Edición Conmemorativa)',
        autor: 'Julio Cortázar',
        anio_publicacion: 1963
      };
      libroModel.update.mockResolvedValue({ id: 3, ...datosActualizados });

      const res = await request(app)
        .put('/libros/3')
        .send(datosActualizados);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(3);
      expect(res.body.titulo).toBe('Rayuela (Edición Conmemorativa)');
      expect(libroModel.update).toHaveBeenCalledWith(3, datosActualizados);
    });

    it('debe responder 404 al intentar actualizar un libro inexistente', async () => {
      libroModel.update.mockResolvedValue(null);

      const res = await request(app)
        .put('/libros/999')
        .send({ titulo: 'No existe', autor: 'Desconocido', anio_publicacion: 2000 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Libro con ID 999 no encontrado');
    });

    it('debe responder 400 si los datos de actualización son inválidos', async () => {
      const res = await request(app)
        .put('/libros/1')
        .send({ titulo: '', autor: 'Desconocido', anio_publicacion: 2000 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /libros/:id', () => {
    it('debe eliminar un libro existente y responder 200', async () => {
      libroModel.delete.mockResolvedValue(true);

      const res = await request(app).delete('/libros/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Libro eliminado correctamente');
      expect(res.body).toHaveProperty('id', 1);
      expect(libroModel.delete).toHaveBeenCalledWith(1);
    });

    it('debe responder 404 al intentar eliminar un libro inexistente', async () => {
      libroModel.delete.mockResolvedValue(false);

      const res = await request(app).delete('/libros/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Libro con ID 999 no encontrado');
    });
  });

  describe('Manejo de rutas inexistentes', () => {
    it('debe responder 404 para rutas desconocidas', async () => {
      const res = await request(app).get('/api/ruta-desconocida');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Ruta no encontrada');
    });
  });
});
