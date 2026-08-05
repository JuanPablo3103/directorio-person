// Instancia de axios configurada para consumir la API del backend.
// Centraliza tres cosas para que el resto del frontend no tenga que
// repetirlas: la URL base, el envío automático del token JWT y el
// manejo de sesiones inválidas o expiradas.

import axios from 'axios';

const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Antes de cada petición: si hay un token guardado de una sesión previa,
// se agrega al encabezado Authorization con el formato que exige el
// middleware del backend ("Bearer <token>").
clienteApi.interceptors.request.use((configuracion) => {
  const token = localStorage.getItem('token');

  if (token) {
    configuracion.headers.Authorization = `Bearer ${token}`;
  }

  return configuracion;
});

// Después de cada respuesta: si el backend devuelve 401, la sesión ya no
// sirve (token ausente, inválido o expirado), así que se limpia lo
// guardado y se manda al usuario al login.
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Se excluye el propio login: un 401 ahí es "usuario o contraseña
    // incorrectos" (un error normal que el formulario debe mostrar),
    // no una sesión vencida. No tiene sentido limpiar ni redirigir.
    const esPeticionDeLogin = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !esPeticionDeLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      // Los interceptores de axios corren fuera del árbol de componentes
      // de React, así que no hay acceso al router de react-router aquí.
      // Una redirección dura del navegador es la forma simple y confiable
      // de garantizar que se llega al login con el estado ya limpio.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
