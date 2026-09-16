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

/**
 * @swagger
 * /api/personas/{id}/telefonos:
 *   get:
 *     summary: Lista los teléfonos de una persona
 *     tags: [Teléfonos]
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
 *         description: Lista de teléfonos de la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numero:
 *                     type: string
 *                   tipoId:
 *                     type: integer
 *                   tipo:
 *                     type: string
 *                   modificado:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// GET /api/personas/:id/telefonos -> lista los teléfonos de una persona
router.get('/:id/telefonos', telefonosController.listarTelefonos);

/**
 * @swagger
 * /api/personas/{id}/telefonos:
 *   post:
 *     summary: Agrega un teléfono a una persona
 *     tags: [Teléfonos]
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
 *               - numero
 *               - tipoId
 *             properties:
 *               numero:
 *                 type: string
 *                 example: 697-555-0142
 *               tipoId:
 *                 type: integer
 *                 description: PhoneNumberTypeID (ver /api/catalogos/tipos-telefono)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Teléfono creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numero:
 *                   type: string
 *                 tipoId:
 *                   type: integer
 *                 tipo:
 *                   type: string
 *                 modificado:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: numero/tipoId obligatorios, o tipoId inexistente en Person.PhoneNumberType
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 *       409:
 *         description: El número ya está registrado con ese tipo para esta persona
 */
// POST /api/personas/:id/telefonos -> agrega un teléfono a una persona
router.post('/:id/telefonos', validacionesCrearTelefono, telefonosController.crearTelefono);

/**
 * @swagger
 * /api/personas/{id}/telefonos:
 *   delete:
 *     summary: Elimina un teléfono de una persona
 *     tags: [Teléfonos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BusinessEntityID de la persona
 *       - in: query
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *         description: PhoneNumber exacto a eliminar
 *       - in: query
 *         name: tipoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: PhoneNumberTypeID exacto a eliminar (la clave es compuesta)
 *     responses:
 *       200:
 *         description: Teléfono eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       400:
 *         description: Los query params numero y tipoId son obligatorios
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe esa combinación de número y tipo para esa persona
 */
// DELETE /api/personas/:id/telefonos?numero=...&tipoId=... -> elimina un
// teléfono puntual (la clave es compuesta, por eso van dos query params)
router.delete('/:id/telefonos', telefonosController.eliminarTelefono);

module.exports = router;
