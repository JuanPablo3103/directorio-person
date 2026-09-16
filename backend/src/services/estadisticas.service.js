// Indicadores agregados del directorio, para la pantalla de inicio.
// Todas las consultas son de solo lectura: este módulo no escribe nada.

const { obtenerPool } = require('../config/db');

// Mismos seis códigos de Person.Person.PersonType que ya se usan en
// personas.routes.js. Se inicializan en 0 para que el conteo por tipo
// siempre traiga las seis claves, aunque alguna no tenga filas todavía
// (el frontend arma un gráfico de barras y necesita las seis para dibujar
// las proporciones correctamente, no solo las que tengan datos).
const CONTEO_INICIAL_POR_TIPO = { EM: 0, SP: 0, SC: 0, IN: 0, VC: 0, GC: 0 };

// GET /api/estadisticas
async function obtenerEstadisticas() {
  const pool = await obtenerPool();

  const resultadoTotalPersonas = await pool.request()
    .query('SELECT COUNT(*) AS total FROM Person.Person;');

  const resultadoPorTipo = await pool.request()
    .query(`
      SELECT PersonType, COUNT(*) AS total
      FROM Person.Person
      GROUP BY PersonType;
    `);

  const resultadoTotalCorreos = await pool.request()
    .query('SELECT COUNT(*) AS total FROM Person.EmailAddress;');

  const resultadoTotalTelefonos = await pool.request()
    .query('SELECT COUNT(*) AS total FROM Person.PersonPhone;');

  const resultadoTotalDirecciones = await pool.request()
    .query('SELECT COUNT(*) AS total FROM Person.BusinessEntityAddress;');

  const porTipo = { ...CONTEO_INICIAL_POR_TIPO };
  for (const fila of resultadoPorTipo.recordset) {
    porTipo[fila.PersonType] = fila.total;
  }

  return {
    totalPersonas: resultadoTotalPersonas.recordset[0].total,
    porTipo,
    totalCorreos: resultadoTotalCorreos.recordset[0].total,
    totalTelefonos: resultadoTotalTelefonos.recordset[0].total,
    totalDirecciones: resultadoTotalDirecciones.recordset[0].total
  };
}

module.exports = { obtenerEstadisticas };
