// Encabezado común a las páginas protegidas.

import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

function Encabezado() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-base font-bold text-white">
            DP
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-slate-800">Directorio Person</p>
            <p className="text-sm text-slate-400">Gestión de contactos</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar nombre={usuario?.NombreCompleto} tamano="sm" />
            <span className="text-base font-medium text-slate-700">{usuario?.NombreCompleto}</span>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Encabezado;