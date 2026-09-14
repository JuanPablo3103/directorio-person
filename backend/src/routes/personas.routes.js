// Definición de rutas del recurso "personas".
// Solo declara las rutas y las enlaza con su controlador; no contiene lógica.

const express = require('express');
const { body } = require('express-validator');
const personasController = require('../controllers/personas.controller');

const router = express.Router();

// Valores permitidos para PersonType en Person.Person:
// EM=Empleado, SP=Vendedor persona, SC=Contacto de tienda,
// IN=Individual (cliente), VC=Contacto de proveedor, GC=Contacto general.
const TIPOS_PERSONA_VALIDOS = ['EM', 'SP', 'SC', 'IN', 'VC', 'GC'];

// Reglas de validación para POST /api/personas.
// Corren como middleware antes del controlador; si alguna falla, el
// controlador las recoge con validationResult y responde 400.
const validacionesCrearPersona = [
  body('personType')
    .trim()
    .notEmpty().withMessage('El tipo de persona (personType) es obligatorio.')
    .isIn(TIPOS_PERSONA_VALIDOS)
    .withMessage(`El tipo de persona debe ser uno de: ${TIPOS_PERSONA_VALIDOS.join(', ')}.`),

  body('firstName')
    .trim()
    .notEmpty().withMessage('El nombre (firstName) es obligatorio.')
    .isLength({ max: 50 }).withMessage('El nombre (firstName) no puede superar los 50 caracteres.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido (lastName) es obligatorio.')
    .isLength({ max: 50 }).withMessage('El apellido (lastName) no puede superar los 50 caracteres.'),

  body('title')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 8 }).withMessage('El título (title) no puede superar los 8 caracteres.'),

  body('middleName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 }).withMessage('El segundo nombre (middleName) no puede superar los 50 caracteres.'),

  body('suffix')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 10 }).withMessage('El sufijo (suffix) no puede superar los 10 caracteres.'),

  body('emailPromotion')
    .optional({ values: 'undefined' })
    .isInt({ min: 0, max: 2 }).withMessage('emailPromotion debe ser 0, 1 o 2.')
    .toInt()
];

// GET /api/personas -> listado paginado, con búsqueda y filtro por tipo
router.get('/', personasController.listarPersonas);

// GET /api/personas/:id -> detalle de una persona (datos, correos, teléfonos, direcciones)
router.get('/:id', personasController.obtenerPersonaPorId);

// POST /api/personas -> registra una persona nueva (BusinessEntity + Person en una transacción)
router.post('/', validacionesCrearPersona, personasController.crearPersona);

module.exports = router;
