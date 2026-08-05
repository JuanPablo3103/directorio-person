// Script suelto (no forma parte de la API) para crear un usuario en
// dbo.UsuarioAplicacion con la contraseña ya cifrada con bcrypt.
//
// Uso:
//   node scripts/crear-usuario.js <nombreUsuario> <contrasena> <nombreCompleto>
// Ejemplo:
//   node scripts/crear-usuario.js admin "Secreta#2026" "Administrador del Sistema"

require('dotenv').config();
const bcrypt = require('bcrypt');
const { obtenerPool, sql } = require('../src/config/db');

const COSTO_HASH = 10;

function mostrarUso() {
  console.error('Uso: node scripts/crear-usuario.js <nombreUsuario> <contrasena> <nombreCompleto>');
  console.error('Ejemplo: node scripts/crear-usuario.js admin "Secreta#2026" "Administrador del Sistema"');
}

// Inserta el usuario si el nombre aún no existe. Devuelve el ID generado.
async function crearUsuario(nombreUsuario, contrasena, nombreCompleto) {
  const pool = await obtenerPool();

  const existente = await pool.request()
    .input('nombreUsuario', sql.NVarChar(50), nombreUsuario)
    .query('SELECT UsuarioAplicacionID FROM dbo.UsuarioAplicacion WHERE NombreUsuario = @nombreUsuario;');

  if (existente.recordset.length > 0) {
    throw new Error(`Ya existe un usuario con el nombre "${nombreUsuario}".`);
  }

  const hashContrasena = await bcrypt.hash(contrasena, COSTO_HASH);

  const resultado = await pool.request()
    .input('nombreUsuario', sql.NVarChar(50), nombreUsuario)
    .input('hashContrasena', sql.NVarChar(255), hashContrasena)
    .input('nombreCompleto', sql.NVarChar(100), nombreCompleto)
    .query(`
      INSERT INTO dbo.UsuarioAplicacion (NombreUsuario, HashContrasena, NombreCompleto)
      OUTPUT INSERTED.UsuarioAplicacionID
      VALUES (@nombreUsuario, @hashContrasena, @nombreCompleto);
    `);

  return resultado.recordset[0].UsuarioAplicacionID;
}

async function main() {
  const [, , nombreUsuario, contrasena, nombreCompleto] = process.argv;

  if (!nombreUsuario || !contrasena || !nombreCompleto) {
    mostrarUso();
    process.exit(1);
  }

  try {
    const id = await crearUsuario(nombreUsuario, contrasena, nombreCompleto);
    console.log(`Usuario "${nombreUsuario}" creado correctamente (UsuarioAplicacionID: ${id}).`);
    process.exitCode = 0;
  } catch (error) {
    console.error('Error al crear el usuario:', error.message);
    process.exitCode = 1;
  } finally {
    const pool = await obtenerPool();
    await pool.close();
    process.exit(process.exitCode ?? 0);
  }
}

main();
