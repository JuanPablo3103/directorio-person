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

/**
 * @swagger
 * /api/personas/{id}/direcciones:
 *   get:
 *     summary: Lista las direcciones de una persona
 *     tags: [Direcciones]
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
 *         description: Lista de direcciones de la persona (array vacío si no tiene ninguna)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   addressId:
 *                     type: integer
 *                   tipoDireccion:
 *                     type: string
 *                   addressTypeId:
 *                     type: integer
 *                   linea1:
 *                     type: string
 *                   linea2:
 *                     type: string
 *                     nullable: true
 *                   ciudad:
 *                     type: string
 *                   estadoProvincia:
 *                     type: string
 *                   stateProvinceId:
 *                     type: integer
 *                   pais:
 *                     type: string
 *                   codigoPostal:
 *                     type: string
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// GET /api/personas/:id/direcciones -> lista las direcciones de una persona
router.get('/:id/direcciones', direccionesController.listarDirecciones);

/**
 * @swagger
 * /api/personas/{id}/direcciones:
 *   post:
 *     summary: Asocia una nueva dirección a una persona
 *     tags: [Direcciones]
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
 *               - addressLine1
 *               - city
 *               - stateProvinceId
 *               - postalCode
 *               - addressTypeId
 *             properties:
 *               addressLine1:
 *                 type: string
 *                 example: 1234 Main St
 *               addressLine2:
 *                 type: string
 *                 nullable: true
 *               city:
 *                 type: string
 *                 example: Redmond
 *               stateProvinceId:
 *                 type: integer
 *                 description: StateProvinceID (ver /api/catalogos/estados)
 *                 example: 79
 *               postalCode:
 *                 type: string
 *                 example: "98052"
 *               addressTypeId:
 *                 type: integer
 *                 description: AddressTypeID (ver /api/catalogos/tipos-direccion)
 *                 example: 2
 *     responses:
 *       201:
 *         description: Dirección creada y asociada a la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addressId:
 *                   type: integer
 *                 tipoDireccion:
 *                   type: string
 *                 addressTypeId:
 *                   type: integer
 *                 linea1:
 *                   type: string
 *                 linea2:
 *                   type: string
 *                   nullable: true
 *                 ciudad:
 *                   type: string
 *                 estadoProvincia:
 *                   type: string
 *                 stateProvinceId:
 *                   type: integer
 *                 pais:
 *                   type: string
 *                 codigoPostal:
 *                   type: string
 *       400:
 *         description: Campos obligatorios faltantes/inválidos, o stateProvinceId/addressTypeId inexistentes
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// POST /api/personas/:id/direcciones -> asocia una nueva dirección a una persona
router.post('/:id/direcciones', validacionesCrearDireccion, direccionesController.crearDireccion);

/**
 * @swagger
 * /api/personas/{id}/direcciones/{addressId}:
 *   delete:
 *     summary: Quita el vínculo de una dirección de una persona
 *     description: Elimina solo el vínculo en Person.BusinessEntityAddress; la fila de Person.Address no se borra, porque puede estar compartida con otra entidad.
 *     tags: [Direcciones]
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
 *         name: addressId
 *         required: true
 *         schema:
 *           type: integer
 *         description: AddressID de la dirección a desvincular
 *     responses:
 *       200:
 *         description: Dirección desvinculada
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
 *         description: No existe esa dirección para esa persona
 */
// DELETE /api/personas/:id/direcciones/:addressId -> quita el vínculo de
// una dirección puntual (no borra Person.Address, ver direcciones.service.js)
router.delete('/:id/direcciones/:addressId', direccionesController.eliminarDireccion);

module.exports = router;
