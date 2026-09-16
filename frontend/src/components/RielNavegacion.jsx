// Riel de navegación persistente: la franja de 3px pegada al borde
// izquierdo del viewport (el "riel") más la columna de navegación que
// cuelga de ella. No son dos elementos separados por elección de diseño:
// el riel es, literalmente, el borde izquierdo de esta columna.
//
// El segmento ámbar que marca la sección activa no se calcula midiendo
// el DOM (no hace falta un ref ni un ResizeObserver): como cada fila de
// navegación tiene una altura fija (ALTO_ITEM), la posición del segmento
// es pura aritmética a partir del índice del ítem activo.
//
// Por debajo de md no hay espacio para una columna fija de 208px: acá se
// convierte en un cajón que se desliza desde el borde izquierdo, abierto
// por BarraContexto (botón de menú) y controlado por Shell (el estado
// "abierto" vive un nivel arriba, donde ambos componentes son hermanos).

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Marca } from './Logo';

const ALTO_ENCABEZADO = 72;
const ALTO_ITEM = 44;

const ITEMS_NAV = [
  {
    etiqueta: 'Inicio',
    ruta: '/',
    coincide: (pathname) => pathname === '/'
  },
  {
    etiqueta: 'Personas',
    ruta: '/personas',
    // Cubre listado, detalle, crear y editar: todo lo que cuelga de
    // "/personas/..." pertenece a la misma sección de navegación.
    coincide: (pathname) => pathname.startsWith('/personas')
  }
];

function RielNavegacion({ abierto, onCerrar }) {
  const { pathname } = useLocation();
  const indiceActivo = ITEMS_NAV.findIndex((item) => item.coincide(pathname));

  // Escape cierra el cajón en mobile. En md+ "abierto" no se usa para
  // nada (el nav siempre está visible), así que este listener no molesta.
  useEffect(() => {
    if (!abierto) return;

    function manejarTecla(evento) {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    }

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [abierto, onCerrar]);

  return (
    <>
      {/* Fondo: solo existe en mobile y solo mientras el cajón está abierto. */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-tinta/50 md:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-50 flex w-52 shrink-0 flex-col border-r border-borde bg-superficie transition-transform duration-200 ease-out motion-reduce:transition-none md:relative md:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-y-0 left-0 w-[3px] bg-borde-fuerte" aria-hidden="true">
          {indiceActivo >= 0 && (
            <div
              className="absolute left-0 w-[3px] bg-acento transition-[top] duration-200 ease-out motion-reduce:transition-none"
              style={{ top: ALTO_ENCABEZADO + indiceActivo * ALTO_ITEM, height: ALTO_ITEM }}
            />
          )}
        </div>

        <div style={{ height: ALTO_ENCABEZADO }} className="flex items-center gap-2 pl-6">
          <Marca tamano={22} className="shrink-0 text-texto" />
          <span className="font-display text-sm font-semibold tracking-tight text-texto">
            AW
          </span>
        </div>

        <ul className="flex flex-col">
          {ITEMS_NAV.map((item) => {
            const activo = item.coincide(pathname);

            return (
              <li key={item.ruta} style={{ height: ALTO_ITEM }}>
                <Link
                  to={item.ruta}
                  onClick={onCerrar}
                  aria-current={activo ? 'page' : undefined}
                  className={`flex h-full items-center pl-6 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:-ring-offset-2 focus-visible:ring-acento ${
                    activo ? 'font-medium text-texto' : 'text-texto-secundario hover:text-texto'
                  }`}
                >
                  {item.etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default RielNavegacion;
