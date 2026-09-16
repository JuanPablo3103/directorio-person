// Módulo de conexión a SQL Server.
// Mantiene un único pool de conexiones reutilizable en toda la aplicación.

const sql = require('mssql');
require('dotenv').config();

const configuracion = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
  },
  pool: {
    max: 10,              // máximo de conexiones abiertas a la vez
    min: 0,               // mínimo en reposo
    idleTimeoutMillis: 30000
  }
};

// Guarda la promesa del pool para no crear uno nuevo en cada petición.
let poolPromesa = null;

async function obtenerPool() {
  if (!poolPromesa) {
    poolPromesa = new sql.ConnectionPool(configuracion)
      .connect()
      .catch((error) => {
        poolPromesa = null;   // permite reintentar si la conexión falló
        throw error;
      });
  }
  return poolPromesa;
}

// Verifica que la base de datos responde. Se usa al arrancar el servidor.
async function probarConexion() {
  const pool = await obtenerPool();
  const resultado = await pool.request().query('SELECT 1 AS ok');
  return resultado.recordset[0].ok === 1;
}

module.exports = { sql, obtenerPool, probarConexion };