// Definición de rutas de autenticación.
// Solo declara las rutas y las enlaza con su controlador (y, cuando
// corresponde, con el middleware que protege la ruta).

const express = require('express');
const authController = require('../controllers/auth.controller');
const verificarToken = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/auth/login -> inicio de sesión, ruta pública
router.post('/login', authController.iniciarSesion);

// GET /api/auth/perfil -> datos del usuario autenticado, ruta protegida
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;
