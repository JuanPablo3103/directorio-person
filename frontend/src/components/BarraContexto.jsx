// Barra de contexto: la franja de 56px sobre el contenido. Reemplaza al
// viejo Encabezado.jsx (que cada página montaba por su cuenta, con su
// propio fondo y su propio botón de cerrar sesión repetido). Ahora vive
// una sola vez en el Shell y muestra, además, el título de la sección
// actual, el botón de menú (solo mobile) y el toggle de tema.

import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ALTO_BARRA = 56;

// Deriva el título desde la ruta en vez de que cada página lo pase como
// prop: así ninguna pantalla nueva puede "olvidarse" de ponerlo, y el
// título siempre coincide con lo que dice la URL. El valor por defecto es
// lo que ve la ruta comodín "*" (NoEncontrado, ver App.jsx): cualquier
// path que no matchee ninguna ruta real cae acá.
function tituloDesdeRuta(pathname) {
  if (pathname === '/') return 'Inicio';
  if (pathname === '/personas') return 'Personas';
  if (pathname === '/personas/nueva') return 'Registrar persona';
  if (/^\/personas\/\d+\/editar$/.test(pathname)) return 'Editar persona';
  if (/^\/personas\/\d+$/.test(pathname)) return 'Detalle de persona';
  return 'Página no encontrada';
}

function BarraContexto({ onAbrirMenu }) {
  const { pathname } = useLocation();
  const { usuario, cerrarSesion } = useAuth();
  const { esOscuro, alternarTema } = useTheme();

  return (
    <header
      style={{ height: ALTO_BARRA }}
      className="flex shrink-0 items-center justify-between gap-3 border-b border-borde bg-superficie px-4 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-1">
        {/* Solo existe por debajo de md: en desktop el riel ya está
            siempre visible, no hace falta un botón para mostrarlo. */}
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menú de navegación"
          className="-ml-1.5 rounded-[var(--radius-control)] p-1.5 text-texto outline-none hover:bg-hoja focus-visible:ring-2 focus-visible:ring-acento md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <h1 className="truncate font-display text-lg font-semibold text-texto">
          {tituloDesdeRuta(pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={alternarTema}
          aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="rounded-[var(--radius-control)] px-2 py-1.5 text-sm text-texto-secundario outline-none hover:text-texto focus-visible:ring-2 focus-visible:ring-acento"
        >
          {esOscuro ? 'Claro' : 'Oscuro'}
        </button>

        <span className="hidden text-sm text-texto-secundario sm:inline">
          {usuario?.NombreCompleto}
        </span>

        <button
          type="button"
          onClick={cerrarSesion}
          className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 text-sm text-texto outline-none hover:bg-hoja focus-visible:ring-2 focus-visible:ring-acento"
        >
          <span className="hidden sm:inline">Cerrar sesión</span>
          <span className="sm:hidden">Salir</span>
        </button>
      </div>
    </header>
  );
}

export default BarraContexto;
