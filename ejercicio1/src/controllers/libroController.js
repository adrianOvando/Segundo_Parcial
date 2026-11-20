const libroModel = require('../models/libroModel');

/**
 * Validador de entrada para libros.
 * Requisitos:
 * - titulo: no vacío
 * - autor: no vacío
 * - anio_publicacion: entero válido
 */
function validateLibro(data) {
  const { titulo, autor, anio_publicacion } = data || {};
  const errors = [];

  if (titulo === undefined || titulo === null || typeof titulo !== 'string' || titulo.trim() === '') {
    errors.push("El campo 'titulo' es obligatorio y no puede estar vacío");
  }

  if (autor === undefined || autor === null || typeof autor !== 'string' || autor.trim() === '') {
    errors.push("El campo 'autor' es obligatorio y no puede estar vacío");
  }

  const anio = Number(anio_publicacion);
  if (
    anio_publicacion === undefined ||
    anio_publicacion === null ||
    typeof anio_publicacion === 'boolean' ||
    !Number.isInteger(anio) ||
    isNaN(anio)
  ) {
    errors.push("El campo 'anio_publicacion' debe ser un número entero válido");
  } else if (anio < -3000 || anio > 2100) {
    errors.push("El campo 'anio_publicacion' debe estar entre el año -3000 y 2100");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      titulo: titulo.trim(),
      autor: autor.trim(),
      anio_publicacion: anio
    } : null
  };
}

/**
 * Valida que el ID en parámetros sea un entero positivo.
 */
function validateId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

const libroController = {
  // GET /health
  healthCheck(req, res) {
    res.status(200).json({
      status: "ok",
      service: "API Catálogo de Libros",
      version: process.env.APP_VERSION || "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  },

  // GET /libros
  async getAll(req, res, next) {
    try {
      const libros = await libroModel.getAll();
      return res.status(200).json(libros);
    } catch (error) {
      next(error);
    }
  },

  // GET /libros/:id
  async getById(req, res, next) {
    try {
      const id = validateId(req.params.id);
      if (!id) {
        return res.status(400).json({
          error: "El parámetro 'id' debe ser un número entero válido"
        });
      }

      const libro = await libroModel.getById(id);
      if (!libro) {
        return res.status(404).json({
          error: `Libro con ID ${id} no encontrado`
        });
      }

      return res.status(200).json(libro);
    } catch (error) {
      next(error);
    }
  },

  // POST /libros
  async create(req, res, next) {
    try {
      const validation = validateLibro(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          detalles: validation.errors
        });
      }

      const nuevoLibro = await libroModel.create(validation.data);
      return res.status(201).json(nuevoLibro);
    } catch (error) {
      next(error);
    }
  },

  // PUT /libros/:id
  async update(req, res, next) {
    try {
      const id = validateId(req.params.id);
      if (!id) {
        return res.status(400).json({
          error: "El parámetro 'id' debe ser un número entero válido"
        });
      }

      const validation = validateLibro(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Datos de entrada inválidos",
          detalles: validation.errors
        });
      }

      const libroActualizado = await libroModel.update(id, validation.data);
      if (!libroActualizado) {
        return res.status(404).json({
          error: `Libro con ID ${id} no encontrado`
        });
      }

      return res.status(200).json(libroActualizado);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /libros/:id
  async delete(req, res, next) {
    try {
      const id = validateId(req.params.id);
      if (!id) {
        return res.status(400).json({
          error: "El parámetro 'id' debe ser un número entero válido"
        });
      }

      const eliminado = await libroModel.delete(id);
      if (!eliminado) {
        return res.status(404).json({
          error: `Libro con ID ${id} no encontrado`
        });
      }

      return res.status(200).json({
        message: "Libro eliminado correctamente",
        id
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = libroController;
