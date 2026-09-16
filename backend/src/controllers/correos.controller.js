// Controlador de correos electrónicos de una persona.
// Lee la petición HTTP, valida el formato de los identificadores de la
// URL, delega en correos.service y devuelve la respuesta exitosa. Como
// el servicio ya lanza noEncontrado/conflicto por su cuenta, acá no hay
// lógica de negocio: solo try/catch + next(error).

const { validationResult } = require('express-validator');
const correosService = require('../services/correos.service');
const { solicitudInvalida } = require('../utils/errores');

// Mismo criterio que en personas.controller.js: enteros positivos sin
// signo ni ceros a la izquierda.
const PATRON_ENTERO_POSITIVO = /^[1-9]\d*$/;

// GET /api/personas/:id/correos
async function listarCorreos(req, res, next) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);

  try {
    const correos = await correosService.listarCorreos(id);
    res.status(200).json(correos);
  } catch (error) {
    next(error);
  }
}

// POST /api/personas/:id/correos
// La validación de formato del correo (body) corre antes como middleware
// en la ruta; acá se revisa el resultado y, si pasa, se valida el id de
// la URL antes de tocar el servicio.
async function crearCorreo(req, res, next) {
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

  try {
    const correoCreado = await correosService.crearCorreo(id, req.body.correo.trim());
    res.status(201).json(correoCreado);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/personas/:id/correos/:correoId
async function eliminarCorreo(req, res, next) {
  const { id: idCrudo, correoId: correoIdCrudo } = req.params;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  if (!PATRON_ENTERO_POSITIVO.test(correoIdCrudo)) {
    return next(
      solicitudInvalida('El identificador del correo debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);
  const correoId = Number(correoIdCrudo);

  try {
    await correosService.eliminarCorreo(id, correoId);
    res.status(200).json({ mensaje: `El correo ${correoId} se eliminó correctamente.` });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarCorreos, crearCorreo, eliminarCorreo };
