// Controlador de autenticación.
// Lee la petición, delega en el servicio y devuelve la respuesta exitosa.
// No conoce bcrypt ni JWT (eso es del servicio) ni construye respuestas
// de error (eso es del middleware manejadorErrores).

const authService = require('../services/auth.service');
const { solicitudInvalida, noAutorizado } = require('../utils/errores');

// POST /api/auth/login
async function iniciarSesion(req, res, next) {
  const { nombreUsuario, contrasena } = req.body ?? {};

  const nombreUsuarioValido = typeof nombreUsuario === 'string' && nombreUsuario.trim() !== '';
  const contrasenaValida = typeof contrasena === 'string' && contrasena.trim() !== '';

  if (!nombreUsuarioValido || !contrasenaValida) {
    return next(solicitudInvalida('Debe indicar nombreUsuario y contrasena.'));
  }

  try {
    const usuario = await authService.validarCredenciales(nombreUsuario.trim(), contrasena);

    if (!usuario) {
      // Mensaje genérico a propósito: no debe revelar si el usuario
      // existe o si lo que falló fue la contraseña.
      return next(noAutorizado('Usuario o contrasena incorrectos.'));
    }

    const token = authService.generarToken(usuario);

    res.status(200).json({ token, usuario });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/perfil
// Ruta protegida: para llegar aquí, auth.middleware.js ya validó el token
// y dejó los datos del usuario en req.usuario.
function perfil(req, res) {
  res.status(200).json(req.usuario);
}

module.exports = { iniciarSesion, perfil };
