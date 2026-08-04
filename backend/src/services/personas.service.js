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

module.exports = { listarPersonas };
