// Encabezado común a las páginas protegidas: título de la app, nombre
// del usuario conectado y botón de cerrar sesión.

import { useAuth } from '../context/AuthContext';

function Encabezado() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-800">Directorio Person</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{usuario?.NombreCompleto}</span>
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Encabezado;
