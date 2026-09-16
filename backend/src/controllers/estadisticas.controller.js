// Controlador de estadísticas del directorio.
// No recibe parámetros ni valida nada: es una consulta agregada de solo
// lectura, protegida por token igual que el resto de la API.

const estadisticasService = require('../services/estadisticas.service');

// GET /api/estadisticas
async function obtenerEstadisticas(req, res, next) {
  try {
    const estadisticas = await estadisticasService.obtenerEstadisticas();
    res.status(200).json(estadisticas);
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerEstadisticas };
