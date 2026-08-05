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

// Acepta únicamente enteros positivos sin signo ni ceros a la izquierda
// (ej. "12" es válido, "0", "-1", "3.5" y "abc" no lo son).
const PATRON_ENTERO_POSITIVO = /^[1-9]\d*$/;

// GET /api/personas/:id
async function obtenerPersonaPorId(req, res) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return res.status(400).json({
      mensaje: 'El identificador de la persona debe ser un número entero positivo.'
    });
  }

  const id = Number(idCrudo);

  try {
    const persona = await personasService.obtenerPersonaPorId(id);

    if (!persona) {
      return res.status(404).json({
        mensaje: `No se encontró ninguna persona con el identificador ${id}.`
      });
    }

    res.status(200).json(persona);
  } catch (error) {
    console.error('Error al obtener el detalle de la persona:', error);
    res.status(500).json({
      mensaje: 'Ocurrió un error al obtener el detalle de la persona.'
    });
  }
}

module.exports = { listarPersonas, obtenerPersonaPorId };
