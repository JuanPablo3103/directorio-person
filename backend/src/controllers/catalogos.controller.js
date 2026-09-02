// Controlador de los catálogos del sistema.
// Lee la petición, delega en el servicio y devuelve la respuesta
// exitosa. Los errores se pasan a manejadorErrores con next(error).

const catalogosService = require('../services/catalogos.service');
const { solicitudInvalida } = require('../utils/errores');

// Person.CountryRegion.CountryRegionCode es nvarchar(3) y en la base
// todos los códigos son de dos letras. Se aceptan dos o tres para no
// quedar por debajo de lo que permite la columna, pero se rechaza
// cualquier otra cosa antes de llegar a la consulta.
const PATRON_CODIGO_PAIS = /^[A-Za-z]{2,3}$/;

// GET /api/catalogos/tipos-telefono
async function listarTiposTelefono(req, res, next) {
  try {
    const tiposTelefono = await catalogosService.listarTiposTelefono();
    res.status(200).json(tiposTelefono);
  } catch (error) {
    next(error);
  }
}

// GET /api/catalogos/tipos-direccion
async function listarTiposDireccion(req, res, next) {
  try {
    const tiposDireccion = await catalogosService.listarTiposDireccion();
    res.status(200).json(tiposDireccion);
  } catch (error) {
    next(error);
  }
}

// GET /api/catalogos/paises
async function listarPaises(req, res, next) {
  try {
    const paises = await catalogosService.listarPaises();
    res.status(200).json(paises);
  } catch (error) {
    next(error);
  }
}

// GET /api/catalogos/estados?pais=US
// El parámetro "pais" es opcional: sin él se devuelven todos los estados.
async function listarEstados(req, res, next) {
  const paisCrudo = req.query.pais;

  // Solo se valida si el parámetro viene con contenido; ausente o vacío
  // significa "sin filtro" y es perfectamente válido.
  const hayFiltroPais = typeof paisCrudo === 'string' && paisCrudo.trim() !== '';

  if (hayFiltroPais && !PATRON_CODIGO_PAIS.test(paisCrudo.trim())) {
    return next(
      solicitudInvalida('El código de país debe tener dos o tres letras, por ejemplo "US".')
    );
  }

  try {
    const estados = await catalogosService.listarEstados(paisCrudo);
    res.status(200).json(estados);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarTiposTelefono,
  listarTiposDireccion,
  listarPaises,
  listarEstados
};
