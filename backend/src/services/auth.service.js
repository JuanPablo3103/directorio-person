// Reglas de negocio de autenticación: validar credenciales contra
// dbo.UsuarioAplicacion y emitir el JWT de sesión.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { obtenerPool, sql } = require('../config/db');

// Hash fijo sin usuario dueño, usado únicamente para que el tiempo de
// respuesta sea equivalente cuando el usuario no existe. Sin esto,
// "usuario no existe" respondería más rápido que "contraseña incorrecta"
// (porque se saltaría el costo de bcrypt.compare), y esa diferencia de
// tiempo podría usarse para averiguar qué nombres de usuario son válidos.
const HASH_DUMMY = '$2b$10$XcQ/j8VCw0jDuq2So.VKReDy498Ji9fLF36hSc7f8tt7IJHDePu8K';

// Busca un usuario activo por nombre de usuario y compara la contraseña
// recibida contra el hash almacenado con bcrypt.
// Devuelve los datos del usuario (sin el hash) si las credenciales son
// correctas, o null si el usuario no existe, está inactivo o la
// contraseña no coincide. El llamador no puede distinguir estos casos
// a partir del valor devuelto, lo cual es intencional.
async function validarCredenciales(nombreUsuario, contrasena) {
  const pool = await obtenerPool();

  const resultado = await pool.request()
    .input('nombreUsuario', sql.NVarChar(50), nombreUsuario)
    .query(`
      SELECT UsuarioAplicacionID, NombreUsuario, HashContrasena, NombreCompleto
      FROM dbo.UsuarioAplicacion
      WHERE NombreUsuario = @nombreUsuario AND Activo = 1;
    `);

  const usuario = resultado.recordset[0];
  if (!usuario) {
    // Se ejecuta un bcrypt.compare igualmente, contra el hash dummy, para
    // que este camino tarde lo mismo que el de contraseña incorrecta.
    // El resultado de la comparación se descarta: siempre se retorna null.
    await bcrypt.compare(contrasena, HASH_DUMMY);
    return null;
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.HashContrasena);
  if (!contrasenaValida) {
    return null;
  }

  // Se descarta el hash antes de devolver el usuario al resto de la app.
  return {
    UsuarioAplicacionID: usuario.UsuarioAplicacionID,
    NombreUsuario: usuario.NombreUsuario,
    NombreCompleto: usuario.NombreCompleto
  };
}

// Firma un JWT con los datos mínimos para identificar al usuario en las
// peticiones siguientes (sin contraseñas ni hashes).
function generarToken(usuario) {
  return jwt.sign(
    {
      UsuarioAplicacionID: usuario.UsuarioAplicacionID,
      NombreUsuario: usuario.NombreUsuario,
      NombreCompleto: usuario.NombreCompleto
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

module.exports = { validarCredenciales, generarToken };
