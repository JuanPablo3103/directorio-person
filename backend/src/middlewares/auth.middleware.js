// Middleware de autenticación: exige un JWT válido en el encabezado
// Authorization antes de dejar pasar la petición a la ruta protegida.

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;

  // Formato esperado: "Authorization: Bearer <token>"
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'No se proporcionó un token de autenticación.'
    });
  }

  const token = encabezado.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      mensaje: 'No se proporcionó un token de autenticación.'
    });
  }

  try {
    const datosToken = jwt.verify(token, process.env.JWT_SECRET);

    // Se adjuntan solo los datos del usuario, no el token completo ni
    // metadatos internos del JWT (iat, exp, etc.).
    req.usuario = {
      UsuarioAplicacionID: datosToken.UsuarioAplicacionID,
      NombreUsuario: datosToken.NombreUsuario,
      NombreCompleto: datosToken.NombreCompleto
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'El token expiró. Inicie sesión nuevamente.'
      });
    }

    return res.status(401).json({
      mensaje: 'El token es inválido.'
    });
  }
}

module.exports = verificarToken;
