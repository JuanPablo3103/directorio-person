// Manejo uniforme de errores de toda la API.
// Es el único lugar donde se construye una respuesta de error: los
// controladores y servicios solo señalan el fallo y lo dejan llegar aquí.

const { ErrorAplicacion } = require('../utils/errores');

// Códigos de error del motor de SQL Server que corresponden a un
// conflicto con el estado actual de los datos (409) y no a un fallo
// del servidor.
const CODIGO_SQL_LLAVE_FORANEA = 547;
const CODIGO_SQL_CLAVE_DUPLICADA_RESTRICCION = 2627;
const CODIGO_SQL_CLAVE_DUPLICADA_INDICE = 2601;

// El driver mssql expone el número de error de SQL Server en distintos
// lugares según cómo se haya propagado (consulta suelta, transacción o
// error envuelto), así que se busca en todos.
function obtenerNumeroErrorSql(error) {
  return (
    error?.number ??
    error?.originalError?.number ??
    error?.originalError?.info?.number ??
    null
  );
}

// Traduce un error del motor de base de datos a un ErrorAplicacion con
// mensaje comprensible. Devuelve null si el error no es uno de los
// contemplados, para que se trate como error inesperado (500).
function traducirErrorSql(error) {
  const numero = obtenerNumeroErrorSql(error);

  if (numero === CODIGO_SQL_LLAVE_FORANEA) {
    return new ErrorAplicacion(
      'La operación no se puede completar porque el registro está relacionado con otros datos.',
      409
    );
  }

  if (
    numero === CODIGO_SQL_CLAVE_DUPLICADA_RESTRICCION ||
    numero === CODIGO_SQL_CLAVE_DUPLICADA_INDICE
  ) {
    return new ErrorAplicacion(
      'Ya existe un registro con esos datos.',
      409
    );
  }

  return null;
}

// Middleware que responde 404 en JSON cuando la dirección solicitada no
// coincide con ninguna ruta registrada. Se monta después de las rutas.
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: true,
    codigo: 404,
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe en esta API.`
  });
}

// Middleware de error de Express. Debe declarar los cuatro parámetros
// (incluido "next", aunque no se use) para que Express lo reconozca
// como manejador de errores y no como un middleware normal.
// eslint-disable-next-line no-unused-vars
function manejadorErrores(error, req, res, next) {
  // El detalle completo (incluida la pila) solo se registra en el
  // servidor; nunca se envía al cliente.
  console.error(`Error en ${req.method} ${req.originalUrl}:`, error);

  // Si la respuesta ya empezó a enviarse, no se puede cambiar el código
  // ni el cuerpo: se delega en el manejador por defecto de Express, que
  // cierra la conexión.
  if (res.headersSent) {
    return next(error);
  }

  // Un error de la propia aplicación ya trae código y un mensaje escrito
  // para mostrarse. Si no lo es, se intenta traducir desde el motor de
  // base de datos antes de darlo por inesperado.
  let errorFinal = error instanceof ErrorAplicacion ? error : traducirErrorSql(error);

  // JSON mal formado en el cuerpo de la petición: express.json() lanza un
  // SyntaxError con status 400. Es culpa del cliente, no del servidor.
  if (!errorFinal && error?.type === 'entity.parse.failed') {
    errorFinal = new ErrorAplicacion('El cuerpo de la petición no es un JSON válido.', 400);
  }

  // Cualquier otro error es inesperado: su mensaje puede contener
  // nombres de tablas, consultas o rutas de archivos, así que se
  // descarta y se responde con un texto genérico.
  const codigo = errorFinal ? errorFinal.codigoHttp : 500;
  const mensaje = errorFinal
    ? errorFinal.message
    : 'Ocurrió un error inesperado en el servidor.';

  res.status(codigo).json({
    error: true,
    codigo,
    mensaje
  });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
