const pool = require('../config/db');

/**
 * Modelo para la entidad Libros.
 * Utiliza consultas SQL parametrizadas para garantizar la seguridad contra inyecciones SQL.
 */
const libroModel = {
  /**
   * Obtiene todos los libros registrados en la base de datos RDS.
   */
  async getAll() {
    const [rows] = await pool.query(
      'SELECT id, titulo, autor, anio_publicacion, created_at, updated_at FROM libros ORDER BY id ASC'
    );
    return rows;
  },

  /**
   * Obtiene un libro por su ID.
   * @param {number} id
   */
  async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, titulo, autor, anio_publicacion, created_at, updated_at FROM libros WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Crea un nuevo libro en la base de datos.
   * @param {Object} data { titulo, autor, anio_publicacion }
   */
  async create({ titulo, autor, anio_publicacion }) {
    const [result] = await pool.query(
      'INSERT INTO libros (titulo, autor, anio_publicacion) VALUES (?, ?, ?)',
      [titulo, autor, anio_publicacion]
    );
    return {
      id: result.insertId,
      titulo,
      autor,
      anio_publicacion
    };
  },

  /**
   * Actualiza los datos de un libro existente.
   * @param {number} id
   * @param {Object} data { titulo, autor, anio_publicacion }
   */
  async update(id, { titulo, autor, anio_publicacion }) {
    const [result] = await pool.query(
      'UPDATE libros SET titulo = ?, autor = ?, anio_publicacion = ? WHERE id = ?',
      [titulo, autor, anio_publicacion, id]
    );
    if (result.affectedRows === 0) {
      return null;
    }
    return {
      id: Number(id),
      titulo,
      autor,
      anio_publicacion
    };
  },

  /**
   * Elimina un libro por su ID.
   * @param {number} id
   */
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM libros WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = libroModel;
