// Configuración de la aplicación Express.
// Aquí se registran los middlewares y las rutas, pero no se arranca el servidor.

const express = require('express');
const cors = require('cors');

const personasRoutes = require('./routes/personas.routes');

const app = express();

// Permite que el frontend (que corre en otro puerto) consuma esta API.
app.use(cors());

// Permite leer cuerpos de petición en formato JSON.
app.use(express.json());

// Ruta de verificación: sirve para comprobar que la API está viva.
app.get('/api/salud', (req, res) => {
  res.json({
    estado: 'ok',
    mensaje: 'API del Directorio Person en funcionamiento',
    fecha: new Date().toISOString()
  });
});

// Rutas del recurso "personas": listado, búsqueda y filtro por tipo.
app.use('/api/personas', personasRoutes);

// Aquí se irán registrando las rutas de los demás recursos.

module.exports = app;