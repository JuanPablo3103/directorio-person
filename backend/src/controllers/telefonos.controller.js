// Controlador de teléfonos de una persona.
// Lee la petición HTTP, valida el formato de los identificadores (URL y
// query params), delega en telefonos.service y devuelve la respuesta
// exitosa. El servicio ya lanza noEncontrado/solicitudInvalida/conflicto
// por su cuenta, así que acá no hay lógica de negocio.

const { validationResult } = require('express-validator');
const telefonosService = require('../services/telefonos.service');
const { solicitudInvalida } = require('../utils/errores');

// Mismo criterio que en los demás controladores: enteros positivos sin
// signo ni ceros a la izquierda.
const PATRON_ENTERO_POSITIVO = /^[1-9]\d*$/;

// GET /api/personas/:id/telefonos
async function listarTelefonos(req, res, next) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);

  try {
    const telefonos = await telefonosService.listarTelefonos(id);
    res.status(200).json(telefonos);
  } catch (error) {
    next(error);
  }
}

// POST /api/personas/:id/telefonos
// La validación de "numero y tipoId obligatorios" corre antes como
// middleware en la ruta; acá se revisa el resultado y el formato del id.
async function crearTelefono(req, res, next) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    const mensaje = errores.array().map((error) => error.msg).join(' ');
    return next(solicitudInvalida(mensaje));
  }

  const id = Number(idCrudo);
  const { numero, tipoId } = req.body;

  try {
    const telefonoCreado = await telefonosService.crearTelefono(id, numero.trim(), Number(tipoId));
    res.status(201).json(telefonoCreado);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/personas/:id/telefonos?numero=...&tipoId=...
async function eliminarTelefono(req, res, next) {
  const idCrudo = req.params.id;
  const { numero, tipoId: tipoIdCrudo } = req.query;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  if (typeof numero !== 'string' || numero.trim() === '') {
    return next(solicitudInvalida('El query param "numero" es obligatorio.'));
  }

  if (typeof tipoIdCrudo !== 'string' || !PATRON_ENTERO_POSITIVO.test(tipoIdCrudo)) {
    return next(
      solicitudInvalida('El query param "tipoId" es obligatorio y debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);
  const tipoId = Number(tipoIdCrudo);

  try {
    await telefonosService.eliminarTelefono(id, numero.trim(), tipoId);
    res.status(200).json({ mensaje: `El teléfono ${numero} (tipo ${tipoId}) se eliminó correctamente.` });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarTelefonos, crearTelefono, eliminarTelefono };
