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

/**
 * @swagger
 * /api/personas/{id}/correos:
 *   get:
 *     summary: Lista los correos electrónicos de una persona
 *     tags: [Correos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BusinessEntityID de la persona
 *     responses:
 *       200:
 *         description: Lista de correos de la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   emailAddressId:
 *                     type: integer
 *                   correo:
 *                     type: string
 *                   modificado:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// GET /api/personas/:id/correos -> lista los correos de una persona
router.get('/:id/correos', correosController.listarCorreos);

/**
 * @swagger
 * /api/personas/{id}/correos:
 *   post:
 *     summary: Agrega un correo electrónico a una persona
 *     tags: [Correos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BusinessEntityID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: ana.perez@ejemplo.com
 *     responses:
 *       201:
 *         description: Correo creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emailAddressId:
 *                   type: integer
 *                 correo:
 *                   type: string
 *                 modificado:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: El correo es obligatorio o no tiene formato válido
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 *       409:
 *         description: El correo ya está registrado para esta persona
 */
// POST /api/personas/:id/correos -> agrega un correo a una persona
router.post('/:id/correos', validacionesCrearCorreo, correosController.crearCorreo);

/**
 * @swagger
 * /api/personas/{id}/correos/{correoId}:
 *   delete:
 *     summary: Elimina un correo electrónico de una persona
 *     tags: [Correos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BusinessEntityID de la persona
 *       - in: path
 *         name: correoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: EmailAddressID del correo (autoincremental por persona)
 *     responses:
 *       200:
 *         description: Correo eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ese correo para esa persona
 */
// DELETE /api/personas/:id/correos/:correoId -> elimina un correo puntual
router.delete('/:id/correos/:correoId', correosController.eliminarCorreo);

module.exports = router;
