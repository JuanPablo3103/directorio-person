// Reglas de negocio y acceso a datos para las direcciones de una persona.
// Cinco tablas del schema Person entran en juego: BusinessEntityAddress
// (tabla puente), Address, AddressType, StateProvince y CountryRegion.
// Mismo estilo que correos.service.js y telefonos.service.js: las
// funciones lanzan directamente los errores de negocio.

const { obtenerPool, sql } = require('../config/db');
const { noEncontrado, solicitudInvalida } = require('../utils/errores');

// Confirma que exista una persona con ese BusinessEntityID en Person.Person.
async function verificarPersonaExiste(pool, id) {
  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT 1 AS existe FROM Person.Person WHERE BusinessEntityID = @id;');

  if (resultado.recordset.length === 0) {
    throw noEncontrado(`No se encontró ninguna persona con el identificador ${id}.`);
  }
}

// Valida que exista el estado/provincia y devuelve, de una sola consulta,
// su nombre y el del país al que pertenece (para no volver a consultarlo
// después del INSERT solo para armar la respuesta).
async function obtenerEstadoProvincia(pool, stateProvinceId) {
  const resultado = await pool.request()
    .input('stateProvinceId', sql.Int, stateProvinceId)
    .query(`
      SELECT sp.Name AS estadoProvincia, cr.Name AS pais
      FROM Person.StateProvince AS sp
      INNER JOIN Person.CountryRegion AS cr ON cr.CountryRegionCode = sp.CountryRegionCode
      WHERE sp.StateProvinceID = @stateProvinceId;
    `);

  const fila = resultado.recordset[0];

  if (!fila) {
    throw solicitudInvalida(`El estado/provincia ${stateProvinceId} no existe.`);
  }

  return fila;
}

// Valida que exista el tipo de dirección y devuelve su nombre.
async function obtenerNombreTipoDireccion(pool, addressTypeId) {
  const resultado = await pool.request()
    .input('addressTypeId', sql.Int, addressTypeId)
    .query('SELECT Name FROM Person.AddressType WHERE AddressTypeID = @addressTypeId;');

  const tipo = resultado.recordset[0];

  if (!tipo) {
    throw solicitudInvalida(`El tipo de dirección ${addressTypeId} no existe.`);
  }

  return tipo.Name;
}

// GET /api/personas/:id/direcciones
// INNER JOIN en las cinco tablas: todas esas relaciones son obligatorias
// en el schema (columnas NOT NULL), así que un LEFT JOIN no aportaría
// nada distinto acá y solo ocultaría un problema real de integridad si
// alguna vez faltara una fila relacionada.
async function listarDirecciones(id) {
  const pool = await obtenerPool();

  await verificarPersonaExiste(pool, id);

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        a.AddressID,
        addrType.Name AS tipoDireccion,
        addrType.AddressTypeID,
        a.AddressLine1,
        a.AddressLine2,
        a.City,
        sp.Name AS estadoProvincia,
        sp.StateProvinceID,
        cr.Name AS pais,
        a.PostalCode
      FROM Person.BusinessEntityAddress AS bea
      INNER JOIN Person.Address AS a
        ON a.AddressID = bea.AddressID
      INNER JOIN Person.AddressType AS addrType
        ON addrType.AddressTypeID = bea.AddressTypeID
      INNER JOIN Person.StateProvince AS sp
        ON sp.StateProvinceID = a.StateProvinceID
      INNER JOIN Person.CountryRegion AS cr
        ON cr.CountryRegionCode = sp.CountryRegionCode
      WHERE bea.BusinessEntityID = @id
      ORDER BY a.AddressID;
    `);

  return resultado.recordset.map((fila) => ({
    addressId: fila.AddressID,
    tipoDireccion: fila.tipoDireccion,
    addressTypeId: fila.AddressTypeID,
    linea1: fila.AddressLine1,
    linea2: fila.AddressLine2,
    ciudad: fila.City,
    estadoProvincia: fila.estadoProvincia,
    stateProvinceId: fila.StateProvinceID,
    pais: fila.pais,
    codigoPostal: fila.PostalCode
  }));
}

// POST /api/personas/:id/direcciones
// datosDireccion ya llega validado en formato (obligatorios, longitudes
// máximas) por express-validator; acá se validan las reglas de negocio
// (persona, estado y tipo existentes) y se ejecuta la transacción.
async function crearDireccion(id, datosDireccion) {
  const { addressLine1, addressLine2, city, stateProvinceId, postalCode, addressTypeId } =
    datosDireccion;

  const pool = await obtenerPool();

  // 1-3: validaciones de existencia, fuera de la transacción.
  await verificarPersonaExiste(pool, id);
  const { estadoProvincia, pais } = await obtenerEstadoProvincia(pool, stateProvinceId);
  const tipoDireccion = await obtenerNombreTipoDireccion(pool, addressTypeId);

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 4a) Person.Address: la dirección física. SpatialLocation se deja en
    // NULL a propósito (no se pide geocodificación en esta HU).
    const resultadoAddress = await new sql.Request(transaction)
      .input('addressLine1', sql.NVarChar(60), addressLine1)
      .input('addressLine2', sql.NVarChar(60), addressLine2 ?? null)
      .input('city', sql.NVarChar(30), city)
      .input('stateProvinceId', sql.Int, stateProvinceId)
      .input('postalCode', sql.NVarChar(15), postalCode)
      .query(`
        INSERT INTO Person.Address (
          AddressLine1, AddressLine2, City, StateProvinceID, PostalCode,
          SpatialLocation, rowguid, ModifiedDate
        )
        OUTPUT INSERTED.AddressID
        VALUES (
          @addressLine1, @addressLine2, @city, @stateProvinceId, @postalCode,
          NULL, NEWID(), GETDATE()
        );
      `);

    const addressId = resultadoAddress.recordset[0].AddressID;

    // 4b) Person.BusinessEntityAddress: vincula la persona con la
    // dirección recién creada y el tipo de dirección elegido.
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .input('addressId', sql.Int, addressId)
      .input('addressTypeId', sql.Int, addressTypeId)
      .query(`
        INSERT INTO Person.BusinessEntityAddress (
          BusinessEntityID, AddressID, AddressTypeID, rowguid, ModifiedDate
        )
        VALUES (@id, @addressId, @addressTypeId, NEWID(), GETDATE());
      `);

    await transaction.commit();

    return {
      addressId,
      tipoDireccion,
      addressTypeId,
      linea1: addressLine1,
      linea2: addressLine2 ?? null,
      ciudad: city,
      estadoProvincia,
      stateProvinceId,
      pais,
      codigoPostal: postalCode
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// DELETE /api/personas/:id/direcciones/:addressId
// Solo borra el vínculo en Person.BusinessEntityAddress: la dirección
// física (Person.Address) no se toca, porque puede estar compartida con
// otras entidades (mismo criterio que aplicamos en eliminarPersona, HU-07,
// para no borrar filas de las que no somos dueños exclusivos).
// No necesita transacción: es un DELETE sobre una sola tabla.
async function eliminarDireccion(id, addressId) {
  const pool = await obtenerPool();

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .input('addressId', sql.Int, addressId)
    .query(`
      DELETE FROM Person.BusinessEntityAddress
      WHERE BusinessEntityID = @id AND AddressID = @addressId;
    `);

  if (resultado.rowsAffected[0] === 0) {
    throw noEncontrado(
      `No se encontró la dirección ${addressId} para la persona ${id}.`
    );
  }
}

module.exports = { listarDirecciones, crearDireccion, eliminarDireccion };
