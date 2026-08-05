// Reglas de negocio y acceso a datos para el listado de personas.
// Toda la lógica de consulta a Person.Person vive aquí; el controlador
// solo reenvía la petición y devuelve lo que este servicio calcule.

const { obtenerPool, sql } = require('../config/db');
const { resolverPaginacion, calcularTotalPaginas } = require('../utils/pagination');

// Condición WHERE compartida entre el conteo y la consulta de datos,
// para garantizar que ambas consultas filtren exactamente lo mismo.
const FILTRO_WHERE = `
  WHERE (@buscar IS NULL
      OR p.FirstName COLLATE Latin1_General_CI_AI LIKE @buscar COLLATE Latin1_General_CI_AI
      OR p.LastName COLLATE Latin1_General_CI_AI LIKE @buscar COLLATE Latin1_General_CI_AI)
    AND (@tipo IS NULL OR p.PersonType = @tipo)
`;

// Lista personas de forma paginada, con búsqueda opcional por nombre/apellido
// y filtro opcional por tipo de persona.
// parametrosCrudos llega tal cual viene de req.query (todo strings o undefined).
async function listarPersonas(parametrosCrudos) {
  const { pagina, limite, offset } = resolverPaginacion(
    parametrosCrudos.pagina,
    parametrosCrudos.limite
  );

  // Si "buscar" viene vacío o no viene, se trata como "sin filtro" (null).
  const buscarTexto = typeof parametrosCrudos.buscar === 'string'
    ? parametrosCrudos.buscar.trim()
    : '';
  const buscarConComodines = buscarTexto !== '' ? `%${buscarTexto}%` : null;

  // Mismo criterio para "tipo".
  const tipoTexto = typeof parametrosCrudos.tipo === 'string'
    ? parametrosCrudos.tipo.trim()
    : '';
  const tipo = tipoTexto !== '' ? tipoTexto : null;

  const pool = await obtenerPool();

  // Conteo total de coincidencias, independiente de la página solicitada.
  const resultadoConteo = await pool.request()
    .input('buscar', sql.NVarChar(sql.MAX), buscarConComodines)
    .input('tipo', sql.NChar(2), tipo)
    .query(`
      SELECT COUNT(*) AS total
      FROM Person.Person AS p
      ${FILTRO_WHERE};
    `);

  const total = resultadoConteo.recordset[0].total;

  // Datos de la página solicitada. El correo se trae con OUTER APPLY porque
  // una persona puede tener varios registros en EmailAddress: se toma solo
  // el primero (por EmailAddressID) para no duplicar filas de la persona.
  const resultadoDatos = await pool.request()
    .input('buscar', sql.NVarChar(sql.MAX), buscarConComodines)
    .input('tipo', sql.NChar(2), tipo)
    .input('offset', sql.Int, offset)
    .input('limite', sql.Int, limite)
    .query(`
      SELECT
        p.BusinessEntityID,
        p.PersonType,
        LTRIM(RTRIM(
          p.FirstName + ISNULL(' ' + p.MiddleName, '') + ' ' + p.LastName
        )) AS nombreCompleto,
        correo.EmailAddress AS correo
      FROM Person.Person AS p
      OUTER APPLY (
        SELECT TOP 1 ea.EmailAddress
        FROM Person.EmailAddress AS ea
        WHERE ea.BusinessEntityID = p.BusinessEntityID
        ORDER BY ea.EmailAddressID
      ) AS correo
      ${FILTRO_WHERE}
      ORDER BY p.BusinessEntityID
      OFFSET @offset ROWS FETCH NEXT @limite ROWS ONLY;
    `);

  const datos = resultadoDatos.recordset.map((fila) => ({
    BusinessEntityID: fila.BusinessEntityID,
    PersonType: fila.PersonType,
    nombreCompleto: fila.nombreCompleto,
    correo: fila.correo ?? ''
  }));

  return {
    datos,
    total,
    pagina,
    limite,
    totalPaginas: calcularTotalPaginas(total, limite)
  };
}

// Obtiene el detalle completo de una persona: datos básicos más sus correos,
// teléfonos y direcciones. Se asume que "id" ya llegó validado como entero
// positivo (esa validación de formato vive en el controlador).
// Devuelve null si no existe ninguna persona con ese BusinessEntityID.
async function obtenerPersonaPorId(id) {
  const pool = await obtenerPool();

  // 1) Datos básicos. Si no hay resultado, la persona no existe y no vale
  // la pena disparar las demás consultas.
  const resultadoPersona = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        BusinessEntityID,
        PersonType,
        Title,
        FirstName,
        MiddleName,
        LastName,
        Suffix,
        EmailPromotion,
        LTRIM(RTRIM(
          FirstName + ISNULL(' ' + MiddleName, '') + ' ' + LastName
        )) AS nombreCompleto
      FROM Person.Person
      WHERE BusinessEntityID = @id;
    `);

  const persona = resultadoPersona.recordset[0];
  if (!persona) {
    return null;
  }

  // 2) Correos: relación uno a muchos directa con Person.EmailAddress.
  const resultadoCorreos = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT EmailAddressID, EmailAddress
      FROM Person.EmailAddress
      WHERE BusinessEntityID = @id
      ORDER BY EmailAddressID;
    `);

  // 3) Teléfonos: se junta con PhoneNumberType solo para traer el nombre
  // legible del tipo (ej. "Cell", "Home"), sin duplicar teléfonos.
  const resultadoTelefonos = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        pp.PhoneNumber,
        pp.PhoneNumberTypeID,
        pnt.Name AS tipoTelefono
      FROM Person.PersonPhone AS pp
      INNER JOIN Person.PhoneNumberType AS pnt
        ON pnt.PhoneNumberTypeID = pp.PhoneNumberTypeID
      WHERE pp.BusinessEntityID = @id
      ORDER BY pp.PhoneNumberTypeID;
    `);

  // 4) Direcciones: BusinessEntityAddress es la tabla puente hacia Address;
  // desde ahí se resuelve el tipo de dirección, el estado/provincia y el país.
  // Cada join es "uno a uno" respecto a la dirección, así que no duplica filas.
  const resultadoDirecciones = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT
        a.AddressID,
        addrType.Name AS tipoDireccion,
        a.AddressLine1,
        a.AddressLine2,
        a.City,
        sp.Name AS estadoProvincia,
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

  return {
    ...persona,
    correos: resultadoCorreos.recordset,
    telefonos: resultadoTelefonos.recordset,
    direcciones: resultadoDirecciones.recordset
  };
}

module.exports = { listarPersonas, obtenerPersonaPorId };
