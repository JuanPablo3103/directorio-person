// Utilidades para resolver parámetros de paginación de forma consistente.
// Centraliza las reglas de valores por defecto y límites para que ningún
// servicio tenga que repetir esta lógica.

const PAGINA_POR_DEFECTO = 1;
const LIMITE_POR_DEFECTO = 20;
const LIMITE_MAXIMO = 100;

// Convierte un valor de query string en un entero positivo.
// Devuelve null si el valor no vino, no es numérico o es menor o igual a cero.
function aEnteroPositivo(valor) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }
  return numero;
}

// Recibe los valores crudos de "pagina" y "limite" (tal como llegan en req.query,
// como string o undefined) y devuelve los valores ya validados, junto con el
// OFFSET que se debe usar en la consulta SQL.
function resolverPaginacion(paginaCruda, limiteCruda) {
  const pagina = aEnteroPositivo(paginaCruda) ?? PAGINA_POR_DEFECTO;

  let limite = aEnteroPositivo(limiteCruda) ?? LIMITE_POR_DEFECTO;
  if (limite > LIMITE_MAXIMO) {
    limite = LIMITE_MAXIMO;
  }

  const offset = (pagina - 1) * limite;

  return { pagina, limite, offset };
}

// Calcula el total de páginas a partir del total de registros encontrados
// y el límite (tamaño de página) que se usó en la consulta.
function calcularTotalPaginas(total, limite) {
  return Math.ceil(total / limite);
}

module.exports = { resolverPaginacion, calcularTotalPaginas };
