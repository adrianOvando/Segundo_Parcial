const express = require('express');
const cors = require('cors');
const libroRoutes = require('./routes/libroRoutes');
const libroController = require('./controllers/libroController');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación de salud (Health Check)
app.get('/health', libroController.healthCheck);

// Rutas de la API de libros
app.use('/libros', libroRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Middleware centralizado para manejo de errores (500)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error no controlado:', err);
  }
  res.status(500).json({
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'production' ? 'Ocurrió un error en la base de datos o en el servidor' : err.message
  });
});

module.exports = app;
