const express = require('express');
const router = express.Router();
const libroController = require('../controllers/libroController');

// Rutas para la gestión del catálogo de libros
router.get('/', libroController.getAll);
router.get('/:id', libroController.getById);
router.post('/', libroController.create);
router.put('/:id', libroController.update);
router.delete('/:id', libroController.delete);

module.exports = router;
