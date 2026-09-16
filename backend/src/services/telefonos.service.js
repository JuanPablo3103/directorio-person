// Reglas de negocio y acceso a datos para los teléfonos de una persona
// (Person.PersonPhone). Mismo estilo que correos.service.js: las funciones
// lanzan directamente noEncontrado/solicitudInvalida/conflicto, porque
// varias reglas (persona existe, tipo existe) se repiten entre listar y
// crear, y centralizarlas acá evita duplicar lógica en el controlador.

const { obtenerPool, sql } = require('../config/db');
const { noEncontrado, solicitudInvalida, conflicto } = require('../utils/errores');

// Código de error de SQL Server para violación de restricción de clave
// (primaria o única). Person.PersonPhone tiene su llave primaria sobre
// (BusinessEntityID, PhoneNumber, PhoneNumberTypeID): un INSERT que repita
// esa combinación exacta dispara este error.
const CODIGO_SQL_CLAVE_DUPLICADA = 2627;

function obtenerNumeroErrorSql(error) {
  return error?.number ?? error?.originalError?.info?.number ?? null;
}

// Confirma que exista una persona con ese BusinessEntityID en Person.Person.
async function verificarPersonaExiste(pool, id) {
  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT 1 AS existe FROM Person.Person WHERE BusinessEntityID = @id;');

  if (resultado.recordset.length === 0) {
    throw noEncontrado(`No se encontró ninguna persona con el identificador ${id}.`);
  }
}

// Confirma que tipoId sea un tipo de teléfono válido y devuelve su nombre
// (Name), para no tener que hacer una segunda consulta después del INSERT.
async function obtenerNombreTipoTelefono(pool, tipoId) {
  const resultado = await pool.request()
    .input('tipoId', sql.Int, tipoId)
    .query('SELECT Name FROM Person.PhoneNumberType WHERE PhoneNumberTypeID = @tipoId;');

  const tipo = resultado.recordset[0];

  if (!tipo) {
    throw solicitudInvalida(`El tipo de teléfono ${tipoId} no existe.`);
  }

  return tipo.Name;
}

// GET /api/personas/:id/telefonos
// Trae los teléfonos con el nombre de su tipo (JOIN con PhoneNumberType),
// ordenados por tipo y luego por número para un orden estable.
async function listarTelefonos(id) {
  const pool = await obtenerPool();

  await verificarPersonaExiste(pool, id);

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        pp.PhoneNumber,
        pp.PhoneNumberTypeID,
        pnt.Name AS tipo,
        pp.ModifiedDate
      FROM Person.PersonPhone AS pp
      INNER JOIN Person.PhoneNumberType AS pnt
        ON pnt.PhoneNumberTypeID = pp.PhoneNumberTypeID
      WHERE pp.BusinessEntityID = @id
      ORDER BY pp.PhoneNumberTypeID, pp.PhoneNumber;
    `);

  return resultado.recordset.map((fila) => ({
    numero: fila.PhoneNumber,
    tipoId: fila.PhoneNumberTypeID,
    tipo: fila.tipo,
    modificado: fila.ModifiedDate
  }));
}

// POST /api/personas/:id/telefonos
// numero y tipoId ya llegan validados como "obligatorios" por
// express-validator; acá se validan las reglas de negocio: persona
// existente, tipo de teléfono existente, y no duplicar la combinación
// exacta (persona + número + tipo).
async function crearTelefono(id, numero, tipoId) {
  const pool = await obtenerPool();

  await verificarPersonaExiste(pool, id);
  const nombreTipo = await obtenerNombreTipoTelefono(pool, tipoId);

  try {
    const resultado = await pool.request()
      .input('id', sql.Int, id)
      .input('numero', sql.NVarChar(25), numero)
      .input('tipoId', sql.Int, tipoId)
      .query(`
        INSERT INTO Person.PersonPhone (BusinessEntityID, PhoneNumber, PhoneNumberTypeID, ModifiedDate)
        OUTPUT INSERTED.ModifiedDate
        VALUES (@id, @numero, @tipoId, GETDATE());
      `);

    return {
      numero,
      tipoId,
      tipo: nombreTipo,
      modificado: resultado.recordset[0].ModifiedDate
    };
  } catch (error) {
    if (obtenerNumeroErrorSql(error) === CODIGO_SQL_CLAVE_DUPLICADA) {
      throw conflicto('El número ya está registrado con ese tipo para esta persona');
    }

    throw error;
  }
}

// DELETE /api/personas/:id/telefonos?numero=...&tipoId=...
// La clave es compuesta por las tres columnas: no alcanza con id+numero
// ni con id+tipoId, porque la misma persona puede tener el mismo número
// registrado con más de un tipo (ej. como "Cell" y como "Home").
async function eliminarTelefono(id, numero, tipoId) {
  const pool = await obtenerPool();

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .input('numero', sql.NVarChar(25), numero)
    .input('tipoId', sql.Int, tipoId)
    .query(`
      DELETE FROM Person.PersonPhone
      WHERE BusinessEntityID = @id
        AND PhoneNumber = @numero
        AND PhoneNumberTypeID = @tipoId;
    `);

  if (resultado.rowsAffected[0] === 0) {
    throw noEncontrado(
      `No se encontró el teléfono ${numero} (tipo ${tipoId}) para la persona ${id}.`
    );
  }
}

module.exports = { listarTelefonos, crearTelefono, eliminarTelefono };
