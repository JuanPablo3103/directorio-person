// Layout persistente de las pantallas protegidas: riel de navegación a la
// izquierda, barra de contexto arriba, contenido de la ruta actual abajo.
// Se usa como ruta padre (patrón layout route), anidada DENTRO de
// RutaProtegida: primero se resuelve si hay sesión, después se decide el
// layout. Así el chequeo de autenticación y la decisión de layout quedan
// en componentes separados, cada uno con una sola responsabilidad.

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RielNavegacion from './RielNavegacion';
import BarraContexto from './BarraContexto';

function Shell() {
  // Por debajo de md, RielNavegacion deja de ser una columna fija y pasa a
  // ser un panel superpuesto (cajón): este estado decide si está abierto.
  // Vive acá, no en RielNavegacion, porque BarraContexto es quien tiene
  // el botón que lo abre.
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-superficie">
      <RielNavegacion abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraContexto onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Shell;
