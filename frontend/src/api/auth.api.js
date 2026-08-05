// Funciones que consumen los endpoints de autenticación del backend.
// Cada una devuelve directamente los datos de la respuesta (no la
// respuesta completa de axios), para que quien las use no tenga que
// escribir ".data" en cada llamada.

import clienteApi from './client';

// POST /api/auth/login -> { token, usuario }
export async function iniciarSesion(nombreUsuario, contrasena) {
  const respuesta = await clienteApi.post('/auth/login', {
    nombreUsuario,
    contrasena
  });

  return respuesta.data;
}

// GET /api/auth/perfil -> datos del usuario autenticado (ruta protegida,
// el token ya se agrega solo gracias al interceptor de client.js)
export async function obtenerPerfil() {
  const respuesta = await clienteApi.get('/auth/perfil');
  return respuesta.data;
}
