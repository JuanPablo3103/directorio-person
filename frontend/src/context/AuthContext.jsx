// Contexto de autenticación: guarda el token y los datos del usuario en
// memoria (React) y en localStorage (para sobrevivir a un refresco de
// página), y expone las funciones para iniciar y cerrar sesión.

import { createContext, useContext, useState } from 'react';
import { iniciarSesion as iniciarSesionApi } from '../api/auth.api';

const AuthContext = createContext(null);

// Lee el usuario guardado de una sesión previa, si existe, para
// inicializar el estado sin esperar a ninguna petición.
function leerUsuarioGuardado() {
  const usuarioGuardado = localStorage.getItem('usuario');
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  // Llama al backend; si las credenciales son correctas, guarda la
  // sesión en el estado y en localStorage. Si son incorrectas, el error
  // de axios se propaga sin capturar, para que la pantalla de login lo
  // reciba y muestre el mensaje al usuario.
  async function iniciarSesion(nombreUsuario, contrasena) {
    const datos = await iniciarSesionApi(nombreUsuario, contrasena);

    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));

    setToken(datos.token);
    setUsuario(datos.usuario);
  }

  // Limpia la sesión tanto del estado como de localStorage.
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    setToken(null);
    setUsuario(null);
  }

  const valor = {
    token,
    usuario,
    estaAutenticado: Boolean(token),
    iniciarSesion,
    cerrarSesion
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Hook de conveniencia: evita repetir useContext(AuthContext) en cada
// componente y falla temprano si se usa fuera del proveedor.
export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }

  return contexto;
}
