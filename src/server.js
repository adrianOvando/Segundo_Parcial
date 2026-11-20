const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` API Catálogo de Libros iniciada correctamente `);
  console.log(` Puerto: ${PORT}                               `);
  console.log(` Entorno: ${process.env.NODE_ENV || 'development'} `);
  console.log(` Endpoint Health: http://localhost:${PORT}/health`);
  console.log(` Endpoint Libros: http://localhost:${PORT}/libros`);
  console.log(`===============================================`);
});
