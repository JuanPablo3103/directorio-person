// Controlador de direcciones de una persona.
// Lee la petición HTTP, valida el formato del id de la URL, delega en
// direcciones.service y devuelve la respuesta exitosa. El servicio ya
// lanza noEncontrado/solicitudInvalida por su cuenta, así que acá no hay
// lógica de negocio: solo try/catch + next(error).

const { validationResult } = require('express-validator');
const direccionesService = require('../services/direcciones.service');
const { solicitudInvalida } = require('../utils/errores');

// Mismo criterio que en los demás controladores: enteros positivos sin
// signo ni ceros a la izquierda.
const PATRON_ENTERO_POSITIVO = /^[1-9]\d*$/;

// GET /api/personas/:id/direcciones
async function listarDirecciones(req, res, next) {
  const idCrudo = req.params.id;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);

  try {
    const direcciones = await direccionesService.listarDirecciones(id);
    res.status(200).json(direcciones);
  } catch (error) {
    next(error);
  }
}

// POST /api/personas/:id/direcciones
// La validación de los campos del body (obligatorios, longitudes máximas)
// corre antes como middleware en la ruta; acá se revisa el resultado y el
// formato del id de la URL antes de tocar el servicio.
async function crearDireccion(req, res, next) {
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
  const { addressLine1, addressLine2, city, stateProvinceId, postalCode, addressTypeId } =
    req.body;

  try {
    const direccionCreada = await direccionesService.crearDireccion(id, {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : undefined,
      city: city.trim(),
      stateProvinceId: Number(stateProvinceId),
      postalCode: postalCode.trim(),
      addressTypeId: Number(addressTypeId)
    });

    res.status(201).json(direccionCreada);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/personas/:id/direcciones/:addressId
async function eliminarDireccion(req, res, next) {
  const { id: idCrudo, addressId: addressIdCrudo } = req.params;

  if (!PATRON_ENTERO_POSITIVO.test(idCrudo)) {
    return next(
      solicitudInvalida('El identificador de la persona debe ser un número entero positivo.')
    );
  }

  if (!PATRON_ENTERO_POSITIVO.test(addressIdCrudo)) {
    return next(
      solicitudInvalida('El identificador de la dirección debe ser un número entero positivo.')
    );
  }

  const id = Number(idCrudo);
  const addressId = Number(addressIdCrudo);

  try {
    await direccionesService.eliminarDireccion(id, addressId);
    res.status(200).json({ mensaje: `La dirección ${addressId} se eliminó correctamente.` });
  } catch (error) {
    next(error);
  }
}

module.exports = { listarDirecciones, crearDireccion, eliminarDireccion };
