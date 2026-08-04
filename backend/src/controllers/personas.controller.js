// Controlador del listado de personas.
// Su única responsabilidad es leer la petición HTTP, delegar el trabajo
// al servicio y traducir el resultado (o el error) a una respuesta HTTP.

const personasService = require('../services/personas.service');

// GET /api/personas
async function listarPersonas(req, res) {
  try {
    const resultado = await personasService.listarPersonas(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al listar personas:', error);
    res.status(500).json({
      mensaje: 'Ocurrió un error al obtener el listado de personas.'
    });
  }
}

module.exports = { listarPersonas };
