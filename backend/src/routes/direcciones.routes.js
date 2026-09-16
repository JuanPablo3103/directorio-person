// Rutas de direcciones de una persona.
// Router aparte de personas.routes.js, montado en app.js bajo el mismo
// prefijo (/api/personas): por eso acá los paths incluyen "/:id/direcciones"
// completo, no un ":id" relativo anidado.

const express = require('express');
const { body } = require('express-validator');
const direccionesController = require('../controllers/direcciones.controller');

const router = express.Router();

// Longitudes máximas alineadas con las columnas de Person.Address:
// AddressLine1/2 NVARCHAR(60), City NVARCHAR(30), PostalCode NVARCHAR(15).
const validacionesCrearDireccion = [
  body('addressLine1')
    .trim()
    .notEmpty().withMessage('La dirección (addressLine1) es obligatoria.')
    .isLength({ max: 60 }).withMessage('La dirección (addressLine1) no puede superar los 60 caracteres.'),

  body('addressLine2')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 }).withMessage('La dirección (addressLine2) no puede superar los 60 caracteres.'),

  body('city')
    .trim()
    .notEmpty().withMessage('La ciudad (city) es obligatoria.')
    .isLength({ max: 30 }).withMessage('La ciudad (city) no puede superar los 30 caracteres.'),

  body('stateProvinceId')
    .notEmpty().withMessage('El estado/provincia (stateProvinceId) es obligatorio.')
    .isInt({ min: 1 }).withMessage('El estado/provincia (stateProvinceId) debe ser un número entero positivo.'),

  body('postalCode')
    .trim()
    .notEmpty().withMessage('El código postal (postalCode) es obligatorio.')
    .isLength({ max: 15 }).withMessage('El código postal (postalCode) no puede superar los 15 caracteres.'),

  body('addressTypeId')
    .notEmpty().withMessage('El tipo de dirección (addressTypeId) es obligatorio.')
    .isInt({ min: 1 }).withMessage('El tipo de dirección (addressTypeId) debe ser un número entero positivo.')
];

// GET /api/personas/:id/direcciones -> lista las direcciones de una persona
router.get('/:id/direcciones', direccionesController.listarDirecciones);

// POST /api/personas/:id/direcciones -> asocia una nueva dirección a una persona
router.post('/:id/direcciones', validacionesCrearDireccion, direccionesController.crearDireccion);

// DELETE /api/personas/:id/direcciones/:addressId -> quita el vínculo de
// una dirección puntual (no borra Person.Address, ver direcciones.service.js)
router.delete('/:id/direcciones/:addressId', direccionesController.eliminarDireccion);

module.exports = router;
