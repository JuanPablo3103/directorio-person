// Componente de ruta protegida: si no hay sesión activa, redirige al
// login en vez de mostrar el contenido de la ruta.
// Se usa como "ruta padre" que envuelve las rutas privadas (patrón
// layout route de react-router), así no hay que repetir la validación
// en cada página protegida.

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RutaProtegida() {
  const { estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    // "replace" evita que el login quede apilado en el historial, para
    // que el botón "atrás" del navegador no regrese a una ruta protegida
    // sin sesión.
    return <Navigate to="/login" replace />;
  }

  // Outlet renderiza la ruta hija que coincidió (ListadoPersonas,
  // DetallePersona, etc.) solo cuando sí hay sesión activa.
  return <Outlet />;
}

export default RutaProtegida;
