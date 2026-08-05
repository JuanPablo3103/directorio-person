// Definición de rutas del recurso "personas".
// Solo declara las rutas y las enlaza con su controlador; no contiene lógica.

const express = require('express');
const personasController = require('../controllers/personas.controller');

const router = express.Router();

// GET /api/personas -> listado paginado, con búsqueda y filtro por tipo
router.get('/', personasController.listarPersonas);

// GET /api/personas/:id -> detalle de una persona (datos, correos, teléfonos, direcciones)
router.get('/:id', personasController.obtenerPersonaPorId);

module.exports = router;
