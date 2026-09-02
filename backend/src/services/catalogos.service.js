// Catálogos del sistema: listas de referencia que alimentan los
// selectores del frontend (tipos de teléfono, tipos de dirección,
// países y estados/provincias).
//
// Todas las consultas son de solo lectura: este módulo no expone
// ninguna operación de escritura sobre las tablas del schema Person.

const { obtenerPool, sql } = require('../config/db');

// Tipos de teléfono (Person.PhoneNumberType): "Cell", "Home", "Work".
async function listarTiposTelefono() {
  const pool = await obtenerPool();

  const resultado = await pool.request().query(`
    SELECT PhoneNumberTypeID, Name
    FROM Person.PhoneNumberType
    ORDER BY Name;
  `);

  return resultado.recordset;
}

// Tipos de dirección (Person.AddressType): "Home", "Shipping", etc.
async function listarTiposDireccion() {
  const pool = await obtenerPool();

  const resultado = await pool.request().query(`
    SELECT AddressTypeID, Name
    FROM Person.AddressType
    ORDER BY Name;
  `);

  return resultado.recordset;
}

// Países (Person.CountryRegion). Su clave primaria es el propio código
// (por ejemplo "US"), no un número, así que ese código es el
// identificador que usará el selector.
async function listarPaises() {
  const pool = await obtenerPool();

  const resultado = await pool.request().query(`
    SELECT CountryRegionCode, Name
    FROM Person.CountryRegion
    ORDER BY Name;
  `);

  return resultado.recordset;
}

// Estados o provincias (Person.StateProvince).
// "pais" es opcional: si llega un código de país se filtra por él; si
// llega vacío o no llega, se devuelven todos.
// Se seleccionan solo las cuatro columnas que necesita un selector, ya
// que la tabla trae varias columnas más que aquí no aportan nada.
async function listarEstados(pais) {
  const pool = await obtenerPool();

  // Vacío o ausente se trata como "sin filtro" (null), mismo criterio
  // que en el listado de personas.
  const codigoPais = typeof pais === 'string' && pais.trim() !== '' ? pais.trim() : null;

  const resultado = await pool.request()
    .input('pais', sql.NVarChar(3), codigoPais)
    .query(`
      SELECT
        StateProvinceID,
        -- StateProvinceCode es nchar(3): se recorta el relleno de
        -- espacios para que el código llegue limpio al frontend.
        RTRIM(StateProvinceCode) AS StateProvinceCode,
        Name,
        CountryRegionCode
      FROM Person.StateProvince
      WHERE (@pais IS NULL OR CountryRegionCode = @pais)
      ORDER BY Name;
    `);

  return resultado.recordset;
}

module.exports = {
  listarTiposTelefono,
  listarTiposDireccion,
  listarPaises,
  listarEstados
};
