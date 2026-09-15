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

// POST /api/personas -> registra una persona nueva.
// datosPersona: { personType, title, firstName, middleName, lastName,
// suffix, emailPromotion }. Los errores de validación (400) llegan tal
// cual del backend en error.response.data; los deja pasar sin capturar
// para que el formulario decida cómo mostrarlos.
export async function crearPersona(datosPersona) {
  const respuesta = await clienteApi.post('/personas', datosPersona);
  return respuesta.data;
}

// PUT /api/personas/:id -> actualiza los datos de una persona existente.
// Mismo formato de datosPersona que crearPersona. Los errores (400 de
// validación, 404 si no existe) llegan tal cual en error.response.data,
// igual que en crearPersona.
export async function actualizarPersona(id, datosPersona) {
  const respuesta = await clienteApi.put(`/personas/${id}`, datosPersona);
  return respuesta.data;
}

// DELETE /api/personas/:id -> elimina una persona. Un 409 significa que
// tiene registros asociados en otros schemas (Sales, HumanResources, etc.);
// se deja pasar en error.response.data.mensaje para que la pantalla lo muestre.
export async function eliminarPersona(id) {
  const respuesta = await clienteApi.delete(`/personas/${id}`);
  return respuesta.data;
}
