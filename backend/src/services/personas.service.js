// Reglas de negocio y acceso a datos para el listado de personas.
// Toda la lógica de consulta a Person.Person vive aquí; el controlador
// solo reenvía la petición y devuelve lo que este servicio calcule.

const { obtenerPool, sql } = require('../config/db');
const { resolverPaginacion, calcularTotalPaginas } = require('../utils/pagination');
const { conflicto } = require('../utils/errores');

// Código de error de SQL Server para violación de llave foránea: significa
// que la persona todavía tiene filas relacionadas en otras tablas (por
// ejemplo Sales.Customer o HumanResources.Employee) que no se están
// borrando acá.
const CODIGO_SQL_LLAVE_FORANEA = 547;

// El driver mssql expone el número de error de SQL Server en distintos
// lugares según cómo se haya propagado.
function obtenerNumeroErrorSql(error) {
  return error?.number ?? error?.originalError?.info?.number ?? null;
}

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

// Crea una persona nueva: primero da de alta la entidad de negocio en
// Person.BusinessEntity (tabla padre, de la que cuelgan Person, Address, etc.)
// y con el BusinessEntityID generado inserta el detalle en Person.Person.
// Ambos inserts van en una sola transacción: si el segundo falla, el primero
// también se revierte y no queda una BusinessEntity "huérfana".
// datosPersona ya llega validado desde el controlador (express-validator).
async function crearPersona(datosPersona) {
  const {
    personType,
    title = null,
    firstName,
    middleName = null,
    lastName,
    suffix = null,
    emailPromotion = 0
  } = datosPersona;

  const pool = await obtenerPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1) Person.BusinessEntity: el ID lo genera SQL Server (identity),
    // por eso se recupera con OUTPUT en el mismo INSERT.
    const resultadoEntidad = await new sql.Request(transaction)
      .query(`
        INSERT INTO Person.BusinessEntity (rowguid, ModifiedDate)
        OUTPUT INSERTED.BusinessEntityID
        VALUES (NEWID(), GETDATE());
      `);

    const businessEntityId = resultadoEntidad.recordset[0].BusinessEntityID;

    // 2) Person.Person: usa el ID recién generado como clave primaria.
    await new sql.Request(transaction)
      .input('businessEntityId', sql.Int, businessEntityId)
      .input('personType', sql.NChar(2), personType)
      .input('title', sql.NVarChar(8), title)
      .input('firstName', sql.NVarChar(50), firstName)
      .input('middleName', sql.NVarChar(50), middleName)
      .input('lastName', sql.NVarChar(50), lastName)
      .input('suffix', sql.NVarChar(10), suffix)
      .input('emailPromotion', sql.Int, emailPromotion)
      .query(`
        INSERT INTO Person.Person (
          BusinessEntityID, PersonType, NameStyle, Title,
          FirstName, MiddleName, LastName, Suffix,
          EmailPromotion, rowguid, ModifiedDate
        )
        VALUES (
          @businessEntityId, @personType, 0, @title,
          @firstName, @middleName, @lastName, @suffix,
          @emailPromotion, NEWID(), GETDATE()
        );
      `);

    await transaction.commit();

    return {
      BusinessEntityID: businessEntityId,
      PersonType: personType,
      Title: title,
      FirstName: firstName,
      MiddleName: middleName,
      LastName: lastName,
      Suffix: suffix,
      EmailPromotion: emailPromotion
    };
  } catch (error) {
    // Revierte ambos inserts si cualquiera de los dos falló.
    await transaction.rollback();
    throw error;
  }
}

// Actualiza los datos de una persona existente en Person.Person.
// No requiere transacción porque toca una sola tabla. Devuelve el objeto
// actualizado, o null si no existe ninguna persona con ese id (0 filas
// afectadas por el UPDATE) para que el controlador responda 404.
// id ya llega validado como entero positivo; datosPersona, validado por
// express-validator (mismas reglas que crearPersona).
async function actualizarPersona(id, datosPersona) {
  const {
    personType,
    title = null,
    firstName,
    middleName = null,
    lastName,
    suffix = null,
    emailPromotion = 0
  } = datosPersona;

  const pool = await obtenerPool();

  const resultado = await pool.request()
    .input('id', sql.Int, id)
    .input('personType', sql.NChar(2), personType)
    .input('title', sql.NVarChar(8), title)
    .input('firstName', sql.NVarChar(50), firstName)
    .input('middleName', sql.NVarChar(50), middleName)
    .input('lastName', sql.NVarChar(50), lastName)
    .input('suffix', sql.NVarChar(10), suffix)
    .input('emailPromotion', sql.Int, emailPromotion)
    .query(`
      UPDATE Person.Person
      SET
        PersonType = @personType,
        Title = @title,
        FirstName = @firstName,
        MiddleName = @middleName,
        LastName = @lastName,
        Suffix = @suffix,
        EmailPromotion = @emailPromotion,
        ModifiedDate = GETDATE()
      WHERE BusinessEntityID = @id;
    `);

  if (resultado.rowsAffected[0] === 0) {
    return null;
  }

  return {
    BusinessEntityID: id,
    PersonType: personType,
    Title: title,
    FirstName: firstName,
    MiddleName: middleName,
    LastName: lastName,
    Suffix: suffix,
    EmailPromotion: emailPromotion
  };
}

// Elimina una persona y todo lo que cuelga directamente de ella dentro del
// schema Person (correos, teléfonos, direcciones), en el orden exacto que
// exige la integridad referencial: primero las tablas hijas, después
// Person.Person y por último Person.BusinessEntity (la tabla padre).
// Devuelve false si el id no existe (el controlador responde 404 sin
// llegar a abrir una transacción); true si se eliminó con éxito.
// Si la persona tiene registros en otros schemas (Sales, HumanResources,
// etc.) el motor rechaza el DELETE de Person.Person o BusinessEntity con
// el error 547, que acá se traduce a un conflicto 409 con un mensaje claro.
async function eliminarPersona(id) {
  const pool = await obtenerPool();

  // Verifica existencia antes de abrir la transacción: no tiene sentido
  // reservar una conexión y arrancar un BEGIN TRANSACTION para un id que
  // no está.
  const resultadoExistencia = await pool.request()
    .input('id', sql.Int, id)
    .query('SELECT 1 AS existe FROM Person.Person WHERE BusinessEntityID = @id;');

  if (resultadoExistencia.recordset.length === 0) {
    return false;
  }

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1) Correos
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('DELETE FROM Person.EmailAddress WHERE BusinessEntityID = @id;');

    // 2) Teléfonos
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('DELETE FROM Person.PersonPhone WHERE BusinessEntityID = @id;');

    // 3) Relación con direcciones (la dirección en sí, Person.Address, no
    // se borra: puede estar compartida con otras personas o entidades).
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('DELETE FROM Person.BusinessEntityAddress WHERE BusinessEntityID = @id;');

    // 4) Persona
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('DELETE FROM Person.Person WHERE BusinessEntityID = @id;');

    // 5) Entidad de negocio (tabla padre)
    await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .query('DELETE FROM Person.BusinessEntity WHERE BusinessEntityID = @id;');

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();

    if (obtenerNumeroErrorSql(error) === CODIGO_SQL_LLAVE_FORANEA) {
      throw conflicto(
        'No se puede eliminar esta persona porque tiene registros asociados en otras áreas del sistema'
      );
    }

    throw error;
  }
}

module.exports = {
  listarPersonas,
  obtenerPersonaPorId,
  crearPersona,
  actualizarPersona,
  eliminarPersona
};
