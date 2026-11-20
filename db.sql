-- ==========================================================
-- Segundo Examen Parcial - Trabajando en la Nube (COM610)
-- Script de Base de Datos para Amazon RDS (MySQL 8.4)
-- Entidad: Libros | Base de datos: libros_db
-- ==========================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS libros_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE libros_db;

-- Crear tabla libros
CREATE TABLE IF NOT EXISTS libros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  anio_publicacion INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de prueba
INSERT INTO libros (titulo, autor, anio_publicacion) VALUES
('Cien años de soledad', 'Gabriel García Márquez', 1967),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 1605),
('Ficciones', 'Jorge Luis Borges', 1944),
('Rayuela', 'Julio Cortázar', 1963),
('El amor en los tiempos del cólera', 'Gabriel García Márquez', 1985);
