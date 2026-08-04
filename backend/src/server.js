// Punto de arranque del servidor.
// Verifica la conexión a la base de datos antes de aceptar peticiones.

require('dotenv').config();
const app = require('./app');
const { probarConexion } = require('./config/db');

const PUERTO = process.env.PORT || 3000;

async function iniciar() {
  try {
    await probarConexion();
    console.log('Conexión a SQL Server establecida correctamente.');
    console.log(`Base de datos: ${process.env.DB_DATABASE}`);

    app.listen(PUERTO, () => {
      console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
      console.log(`Verificación: http://localhost:${PUERTO}/api/salud`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos.');
    console.error(error.message);
    process.exit(1);
  }
}

iniciar();