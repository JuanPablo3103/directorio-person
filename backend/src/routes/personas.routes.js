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

// Reglas de validación de los campos de persona, compartidas entre
// POST /api/personas y PUT /api/personas/:id (mismas reglas de negocio
// para crear y para modificar). Corren como middleware antes del
// controlador; si alguna falla, el controlador las recoge con
// validationResult y responde 400.
const validacionesDatosPersona = [
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

/**
 * @swagger
 * /api/personas:
 *   get:
 *     summary: Lista personas de forma paginada, con búsqueda y filtro por tipo
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (1-indexado)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Texto a buscar contra el nombre completo (nombre + apellido)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [EM, SP, SC, IN, VC, GC]
 *         description: Filtra por PersonType exacto
 *     responses:
 *       200:
 *         description: Página de resultados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       BusinessEntityID:
 *                         type: integer
 *                       PersonType:
 *                         type: string
 *                       nombreCompleto:
 *                         type: string
 *                       correo:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 limite:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       401:
 *         description: Token ausente, inválido o expirado
 */
// GET /api/personas -> listado paginado, con búsqueda y filtro por tipo
router.get('/', personasController.listarPersonas);

/**
 * @swagger
 * /api/personas/{id}:
 *   get:
 *     summary: Obtiene el detalle de una persona (datos básicos, correos, teléfonos y direcciones)
 *     tags: [Personas]
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
 *         description: Detalle completo de la persona
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 BusinessEntityID:
 *                   type: integer
 *                 PersonType:
 *                   type: string
 *                 Title:
 *                   type: string
 *                   nullable: true
 *                 FirstName:
 *                   type: string
 *                 MiddleName:
 *                   type: string
 *                   nullable: true
 *                 LastName:
 *                   type: string
 *                 Suffix:
 *                   type: string
 *                   nullable: true
 *                 EmailPromotion:
 *                   type: integer
 *                 nombreCompleto:
 *                   type: string
 *                 correos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       EmailAddressID:
 *                         type: integer
 *                       EmailAddress:
 *                         type: string
 *                 telefonos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       PhoneNumber:
 *                         type: string
 *                       PhoneNumberTypeID:
 *                         type: integer
 *                       tipoTelefono:
 *                         type: string
 *                 direcciones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       AddressID:
 *                         type: integer
 *                       tipoDireccion:
 *                         type: string
 *                       AddressLine1:
 *                         type: string
 *                       AddressLine2:
 *                         type: string
 *                         nullable: true
 *                       City:
 *                         type: string
 *                       estadoProvincia:
 *                         type: string
 *                       pais:
 *                         type: string
 *                       PostalCode:
 *                         type: string
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// GET /api/personas/:id -> detalle de una persona (datos, correos, teléfonos, direcciones)
router.get('/:id', personasController.obtenerPersonaPorId);

/**
 * @swagger
 * /api/personas:
 *   post:
 *     summary: Registra una persona nueva
 *     description: Inserta en Person.BusinessEntity y Person.Person dentro de una sola transacción.
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personType
 *               - firstName
 *               - lastName
 *             properties:
 *               personType:
 *                 type: string
 *                 enum: [EM, SP, SC, IN, VC, GC]
 *               title:
 *                 type: string
 *                 nullable: true
 *               firstName:
 *                 type: string
 *                 example: Ana
 *               middleName:
 *                 type: string
 *                 nullable: true
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               suffix:
 *                 type: string
 *                 nullable: true
 *               emailPromotion:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *                 default: 0
 *     responses:
 *       201:
 *         description: Persona creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 BusinessEntityID:
 *                   type: integer
 *                 PersonType:
 *                   type: string
 *                 Title:
 *                   type: string
 *                   nullable: true
 *                 FirstName:
 *                   type: string
 *                 MiddleName:
 *                   type: string
 *                   nullable: true
 *                 LastName:
 *                   type: string
 *                 Suffix:
 *                   type: string
 *                   nullable: true
 *                 EmailPromotion:
 *                   type: integer
 *       400:
 *         description: Campos obligatorios faltantes, formato inválido o personType fuera del enum
 *       401:
 *         description: Token ausente, inválido o expirado
 */
// POST /api/personas -> registra una persona nueva (BusinessEntity + Person en una transacción)
router.post('/', validacionesDatosPersona, personasController.crearPersona);

/**
 * @swagger
 * /api/personas/{id}:
 *   put:
 *     summary: Actualiza los datos de una persona existente
 *     tags: [Personas]
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
 *               - personType
 *               - firstName
 *               - lastName
 *             properties:
 *               personType:
 *                 type: string
 *                 enum: [EM, SP, SC, IN, VC, GC]
 *               title:
 *                 type: string
 *                 nullable: true
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *                 nullable: true
 *               lastName:
 *                 type: string
 *               suffix:
 *                 type: string
 *                 nullable: true
 *               emailPromotion:
 *                 type: integer
 *                 enum: [0, 1, 2]
 *                 default: 0
 *     responses:
 *       200:
 *         description: Persona actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 BusinessEntityID:
 *                   type: integer
 *                 PersonType:
 *                   type: string
 *                 Title:
 *                   type: string
 *                   nullable: true
 *                 FirstName:
 *                   type: string
 *                 MiddleName:
 *                   type: string
 *                   nullable: true
 *                 LastName:
 *                   type: string
 *                 Suffix:
 *                   type: string
 *                   nullable: true
 *                 EmailPromotion:
 *                   type: integer
 *       400:
 *         description: Campos obligatorios faltantes, formato inválido o personType fuera del enum
 *       401:
 *         description: Token ausente, inválido o expirado
 *       404:
 *         description: No existe ninguna persona con ese identificador
 */
// PUT /api/personas/:id -> actualiza los datos de una persona existente
router.put('/:id', validacionesDatosPersona, personasController.actualizarPersona);

/**
 * @swagger
 * /api/personas/{id}:
 *   delete:
 *     summary: Elimina una persona del directorio
 *     description: Borra, en una sola transacción, los correos, teléfonos y vínculos de dirección de la persona dentro del schema Person, y luego la persona misma (Person.Person y Person.BusinessEntity).
 *     tags: [Personas]
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
 *         description: Persona eliminada
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
 *         description: No existe ninguna persona con ese identificador
 *       409:
 *         description: La persona tiene registros asociados en otras áreas del sistema (Sales, HumanResources, etc.)
 */
// DELETE /api/personas/:id -> elimina una persona (y sus correos, teléfonos
// y vínculos de dirección dentro del schema Person, en una transacción)
router.delete('/:id', personasController.eliminarPersona);

module.exports = router;
