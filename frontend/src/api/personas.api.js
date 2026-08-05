// Funciones que consumen los endpoints del recurso "personas".
// Ambas rutas están protegidas en el backend; el token se agrega solo
// gracias al interceptor de client.js.

import clienteApi from './client';

// GET /api/personas -> listado paginado, con búsqueda y filtro por tipo.
// Los filtros son opcionales: si alguno viene undefined, axios lo omite
// del query string y el backend aplica sus valores por defecto.
export async function listarPersonas({ pagina, limite, buscar, tipo } = {}) {
  const respuesta = await clienteApi.get('/personas', {
    params: { pagina, limite, buscar, tipo }
  });

  return respuesta.data;
}

// GET /api/personas/:id -> detalle completo (datos básicos, correos,
// teléfonos y direcciones) de una persona.
export async function obtenerPersonaPorId(id) {
  const respuesta = await clienteApi.get(`/personas/${id}`);
  return respuesta.data;
}
