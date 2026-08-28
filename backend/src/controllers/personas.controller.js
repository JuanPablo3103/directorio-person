// Controlador del recurso "personas".
// Su única responsabilidad es leer la petición HTTP, delegar el trabajo
// al servicio y devolver la respuesta exitosa. Los errores se pasan al
// middleware manejadorErrores con next(error); este controlador no
// construye respuestas de error.

const personasService = require('../services/personas.service');
const { solicitudInvalida, noEncontrado } = require('../utils/errores');

// Acepta únicamente enteros positivos sin signo ni ceros a la izquierda
// (ej. "12" es válido, "0", "-1", "3.5" y "abc" no lo son).
const PATRON_ENTERO_POSITIVO = /^[1-9]\d*$/;

// GET /api/personas
async function listarPersonas(req, res, next) {
  try {
    const resultado = await personasService.listarPersonas(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

// GET /api/personas/:id
async function obtenerPersonaPorId(req, res, next) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);

  try {
    const persona = await personasService.obtenerPersonaPorId(id);

    if (!persona) {
      return next(noEncontrado(`No se encontró ninguna persona con el identificador ${id}.`));
    }

    res.status(200).json(persona);
  } catch (error) {
    next(error);
  }
}

module.exports = { listarPersonas, obtenerPersonaPorId };
