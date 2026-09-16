// Rutas de teléfonos de una persona.
// Router aparte de personas.routes.js, montado en app.js bajo el mismo
// prefijo (/api/personas): por eso acá los paths incluyen "/:id/telefonos"
// completo, no un ":id" relativo anidado.

const express = require('express');
const { body } = require('express-validator');
const telefonosController = require('../controllers/telefonos.controller');

const router = express.Router();

// La columna Person.PersonPhone.PhoneNumber es NVARCHAR(25): el límite de
// longitud acá evita un error de truncado del lado de la base de datos.
const validacionesCrearTelefono = [
  body('numero')
    .trim()
    .notEmpty().withMessage('El número de teléfono es obligatorio.')
    .isLength({ max: 25 }).withMessage('El número de teléfono no puede superar los 25 caracteres.'),

  body('tipoId')
    .notEmpty().withMessage('El tipo de teléfono (tipoId) es obligatorio.')
    .isInt({ min: 1 }).withMessage('El tipo de teléfono (tipoId) debe ser un número entero positivo.')
];

// GET /api/personas/:id/telefonos -> lista los teléfonos de una persona
router.get('/:id/telefonos', telefonosController.listarTelefonos);

// POST /api/personas/:id/telefonos -> agrega un teléfono a una persona
router.post('/:id/telefonos', validacionesCrearTelefono, telefonosController.crearTelefono);

// DELETE /api/personas/:id/telefonos?numero=...&tipoId=... -> elimina un
// teléfono puntual (la clave es compuesta, por eso van dos query params)
router.delete('/:id/telefonos', telefonosController.eliminarTelefono);

module.exports = router;
