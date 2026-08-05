// Controlador de autenticación.
// Lee la petición, delega en el servicio y traduce el resultado a HTTP.
// No conoce bcrypt ni JWT: eso es responsabilidad exclusiva del servicio.

const authService = require('../services/auth.service');

// POST /api/auth/login
async function iniciarSesion(req, res) {
  const { nombreUsuario, contrasena } = req.body;

  const nombreUsuarioValido = typeof nombreUsuario === 'string' && nombreUsuario.trim() !== '';
  const contrasenaValida = typeof contrasena === 'string' && contrasena.trim() !== '';

  if (!nombreUsuarioValido || !contrasenaValida) {
    return res.status(400).json({
      mensaje: 'Debe indicar nombreUsuario y contrasena.'
    });
  }

  try {
    const usuario = await authService.validarCredenciales(nombreUsuario.trim(), contrasena);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Usuario o contrasena incorrectos.'
      });
    }

    const token = authService.generarToken(usuario);

    res.status(200).json({ token, usuario });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      mensaje: 'Ocurrió un error al iniciar sesión.'
    });
  }
}

// GET /api/auth/perfil
// Ruta protegida: para llegar aquí, auth.middleware.js ya validó el token
// y dejó los datos del usuario en req.usuario.
function perfil(req, res) {
  res.status(200).json(req.usuario);
}

module.exports = { iniciarSesion, perfil };
