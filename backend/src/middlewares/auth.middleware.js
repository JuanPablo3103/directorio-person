// Middleware de autenticación: exige un JWT válido en el encabezado
// Authorization antes de dejar pasar la petición a la ruta protegida.
// No construye respuestas de error: señala el fallo con next(...) para
// que manejadorErrores arme la respuesta con la estructura uniforme.

const jwt = require('jsonwebtoken');
const { noAutorizado } = require('../utils/errores');

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  // Formato esperado: "Authorization: Bearer <token>"
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return next(noAutorizado('No se proporcionó un token de autenticación.'));
  }

  const token = encabezado.slice('Bearer '.length).trim();

  if (!token) {
    return next(noAutorizado('No se proporcionó un token de autenticación.'));
  }

  // El try cubre únicamente la verificación del token. Si envolviera
  // también al next(), un error lanzado por un middleware posterior
  // volvería hasta aquí y se reportaría como "token inválido".
  let datosToken;

  try {
    datosToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(noAutorizado('El token expiró. Inicie sesión nuevamente.'));
    }

    return next(noAutorizado('El token es inválido.'));
  }

  // Se adjuntan solo los datos del usuario, no el token completo ni
  // metadatos internos del JWT (iat, exp, etc.).
  req.usuario = {
    UsuarioAplicacionID: datosToken.UsuarioAplicacionID,
    NombreUsuario: datosToken.NombreUsuario,
    NombreCompleto: datosToken.NombreCompleto
  };

  next();
}

module.exports = verificarToken;
