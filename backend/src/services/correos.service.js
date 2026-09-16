// Reglas de negocio y acceso a datos para los correos electrónicos de una
// persona (Person.EmailAddress). A diferencia de personas.service.js, acá
// las funciones lanzan directamente los errores de negocio (noEncontrado,
// conflicto) en vez de devolver null/false y dejar que el controlador
// decida: como cada operación necesita el mismo chequeo de "¿existe la
// persona?" antes de hacer cualquier otra cosa, centralizarlo acá evita
// repetirlo en las tres funciones del controlador.

const { obtenerPool, sql } = require('../config/db');
const { noEncontrado, conflicto } = require('../utils/errores');

// Confirma que exista una persona con ese BusinessEntityID en Person.Person.
// Se usa antes de listar, crear o buscar un correo puntual, porque
// Person.EmailAddress no tiene una llave foránea propia que lo garantice
// a nivel de motor (o, si la tiene, igual queremos un mensaje 404 propio
// en vez de un error de base de datos genérico).
async function verificarPersonaExiste(pool, id) {
  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT 1 AS existe FROM Person.Person WHERE BusinessEntityID = @id;');

  if (resultado.recordset.length === 0) {
    throw noEncontrado(`No se encontró ninguna persona con el identificador ${id}.`);
  }
}

// GET /api/personas/:id/correos
// Devuelve todos los correos de la persona, ordenados por EmailAddressID
// (que, al ser autoincremental dentro de cada persona, refleja el orden
// en que se fueron agregando).
async function listarCorreos(id) {
  const pool = await obtenerPool();

  await verificarPersonaExiste(pool, id);

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT EmailAddressID, EmailAddress, ModifiedDate
      FROM Person.EmailAddress
      WHERE BusinessEntityID = @id
      ORDER BY EmailAddressID;
    `);

  return resultado.recordset.map((fila) => ({
    emailAddressId: fila.EmailAddressID,
    correo: fila.EmailAddress,
    modificado: fila.ModifiedDate
  }));
}

// POST /api/personas/:id/correos
// correoNuevo ya llega validado en formato (es un correo bien formado) por
// express-validator, en la capa de rutas; acá solo se valida la regla de
// negocio: que esa persona exista y que no tenga ya ese correo cargado.
async function crearCorreo(id, correoNuevo) {
  const pool = await obtenerPool();

  await verificarPersonaExiste(pool, id);

  // La tabla no tiene UNIQUE sobre EmailAddress, así que el motor jamás
  // va a rechazar un duplicado por su cuenta: hay que revisarlo acá,
  // comparando sin distinguir mayúsculas/minúsculas (Ana@x.com y
  // ana@x.com se consideran el mismo correo).
  const resultadoExistentes = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT EmailAddress FROM Person.EmailAddress WHERE BusinessEntityID = @id;');

  const yaExiste = resultadoExistentes.recordset.some(
    (fila) => fila.EmailAddress.toLowerCase() === correoNuevo.toLowerCase()
  );

  if (yaExiste) {
    throw conflicto('El correo ya está registrado para esta persona');
  }

  // OUTPUT INSERTED devuelve el EmailAddressID que SQL Server generó (es
  // autoincremental por persona, no global) y el ModifiedDate real,
  // sin necesidad de una segunda consulta.
  const resultadoInsercion = await pool.request()
    .input('id', sql.Int, id)
    .input('correo', sql.NVarChar(50), correoNuevo)
    .query(`
      INSERT INTO Person.EmailAddress (BusinessEntityID, EmailAddress, rowguid, ModifiedDate)
      OUTPUT INSERTED.EmailAddressID, INSERTED.ModifiedDate
      VALUES (@id, @correo, NEWID(), GETDATE());
    `);

  const filaInsertada = resultadoInsercion.recordset[0];

  return {
    emailAddressId: filaInsertada.EmailAddressID,
    correo: correoNuevo,
    modificado: filaInsertada.ModifiedDate
  };
}

// DELETE /api/personas/:id/correos/:correoId
// La clave del correo es compuesta (BusinessEntityID, EmailAddressID): no
// alcanza con el EmailAddressID solo, porque se reinicia por persona.
async function eliminarCorreo(id, correoId) {
  const pool = await obtenerPool();

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .input('correoId', sql.Int, correoId)
    .query(`
      DELETE FROM Person.EmailAddress
      WHERE BusinessEntityID = @id AND EmailAddressID = @correoId;
    `);

  if (resultado.rowsAffected[0] === 0) {
    throw noEncontrado(
      `No se encontró el correo ${correoId} para la persona ${id}.`
    );
  }
}

module.exports = { listarCorreos, crearCorreo, eliminarCorreo };
