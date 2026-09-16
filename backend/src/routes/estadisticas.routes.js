// Rutas de estadísticas del directorio.
// Un solo endpoint de solo lectura, protegido con el mismo verificarToken
// que el resto de los recursos (se aplica en app.js, no acá).

const express = require('express');
const estadisticasController = require('../controllers/estadisticas.controller');

const router = express.Router();

/**
 * @swagger
 * /api/estadisticas:
 *   get:
 *     summary: Indicadores agregados del directorio (para la pantalla de inicio)
 *     tags: [Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteos agregados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPersonas:
 *                   type: integer
 *                 porTipo:
 *                   type: object
 *                   description: Cantidad de personas por PersonType
 *                   properties:
 *                     EM:
 *                       type: integer
 *                     SP:
 *                       type: integer
 *                     SC:
 *                       type: integer
 *                     IN:
 *                       type: integer
 *                     VC:
 *                       type: integer
 *                     GC:
 *                       type: integer
 *                 totalCorreos:
 *                   type: integer
 *                 totalTelefonos:
 *                   type: integer
 *                 totalDirecciones:
 *                   type: integer
 *       401:
 *         description: Token ausente, inválido o expirado
 */
// GET /api/estadisticas -> indicadores agregados del directorio
router.get('/', estadisticasController.obtenerEstadisticas);

module.exports = router;
