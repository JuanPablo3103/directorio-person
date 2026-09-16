// Rutas de correos electrónicos de una persona.
// Se registran en app.js bajo el mismo prefijo que personas.routes.js
// (/api/personas), como un router aparte: por eso acá los paths ya
// incluyen "/:id/correos" completo, no un ":id" relativo anidado.

const express = require('express');
const { body } = require('express-validator');
const correosController = require('../controllers/correos.controller');

const router = express.Router();

// La columna Person.EmailAddress.EmailAddress es NVARCHAR(50): el límite
// de longitud acá evita un error de truncado del lado de la base de datos.
const validacionesCrearCorreo = [
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .isLength({ max: 50 }).withMessage('El correo no puede superar los 50 caracteres.')
];

// GET /api/personas/:id/correos -> lista los correos de una persona
router.get('/:id/correos', correosController.listarCorreos);

// POST /api/personas/:id/correos -> agrega un correo a una persona
router.post('/:id/correos', validacionesCrearCorreo, correosController.crearCorreo);

// DELETE /api/personas/:id/correos/:correoId -> elimina un correo puntual
router.delete('/:id/correos/:correoId', correosController.eliminarCorreo);

module.exports = router;
