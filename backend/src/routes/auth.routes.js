// Definición de rutas de autenticación.
// Solo declara las rutas y las enlaza con su controlador (y, cuando
// corresponde, con el middleware que protege la ruta).

const express = require('express');
const authController = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token JWT
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - contrasena
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *                 example: jperez
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 example: MiClave123
 *     responses:
 *       200:
 *         description: Credenciales válidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     UsuarioAplicacionID:
 *                       type: integer
 *                     NombreUsuario:
 *                       type: string
 *                     NombreCompleto:
 *                       type: string
 *       401:
 *         description: Usuario o contraseña incorrectos
 */
// POST /api/auth/login -> inicio de sesión, ruta pública
router.post('/login', authController.iniciarSesion);

// GET /api/auth/perfil -> datos del usuario autenticado, ruta protegida
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;
