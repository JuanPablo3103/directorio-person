// Errores de aplicación: permiten que cualquier capa (servicio o
// controlador) señale un fallo con su código HTTP correspondiente, sin
// tener que armar la respuesta ahí mismo. Quien construye la respuesta
// final es siempre el middleware manejadorErrores.

// Error propio de la aplicación. Se distingue de un error inesperado
// (fallo de conexión, bug, etc.) porque lleva un código HTTP explícito y
// un mensaje pensado para mostrarse al cliente.
class ErrorAplicacion extends Error {
  constructor(mensaje, codigoHttp = 500) {
    super(mensaje);

    // Identifica la clase en los registros y facilita depurar.
    this.name = 'ErrorAplicacion';
    this.codigoHttp = codigoHttp;

    // Excluye al propio constructor del rastreo de la pila, para que
    // apunte al lugar real donde se creó el error.
    Error.captureStackTrace(this, ErrorAplicacion);
  }
}

// Atajos para los casos más frecuentes. Devuelven la instancia del error
// (no la lanzan), para poder usarlos de las dos formas habituales:
//   throw noEncontrado('...');        dentro de un servicio
//   return next(noEncontrado('...')); dentro de un controlador

// 400: la petición está mal formada o le faltan datos obligatorios.
function solicitudInvalida(mensaje) {
  return new ErrorAplicacion(mensaje, 400);
}

// 401: la petición no está autenticada o las credenciales no son válidas.
function noAutorizado(mensaje) {
  return new ErrorAplicacion(mensaje, 401);
}

// 404: el recurso solicitado no existe.
function noEncontrado(mensaje) {
  return new ErrorAplicacion(mensaje, 404);
}

// 409: la petición es válida pero choca con el estado actual de los
// datos (por ejemplo, un valor duplicado o un registro con dependencias).
function conflicto(mensaje) {
  return new ErrorAplicacion(mensaje, 409);
}

module.exports = {
  ErrorAplicacion,
  solicitudInvalida,
  noAutorizado,
  noEncontrado,
  conflicto
};
