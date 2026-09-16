// Control de paginación reutilizado por el listado.

import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

function BotonPagina({ onClick, disabled, children, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:hover:text-slate-600"
    >
      {children}
    </button>
  );
}

function Paginacion({ pagina, totalPaginas, total, onCambiar }) {
  const enPrimeraPagina = pagina <= 1;
  const enUltimaPagina = totalPaginas === 0 || pagina >= totalPaginas;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <span className="text-base text-slate-500">
        Página <span className="font-semibold text-slate-700">{totalPaginas === 0 ? 0 : pagina}</span> de{' '}
        <span className="font-semibold text-slate-700">{totalPaginas}</span>
        <span className="mx-2 text-slate-300">·</span>
        <span className="font-semibold text-slate-700">{total}</span> registros
      </span>

      <div className="flex gap-2">
        <BotonPagina onClick={() => onCambiar(1)} disabled={enPrimeraPagina} ariaLabel="Primera página">
          <ChevronsLeft className="h-5 w-5" />
        </BotonPagina>
        <BotonPagina onClick={() => onCambiar(pagina - 1)} disabled={enPrimeraPagina} ariaLabel="Página anterior">
          <ChevronLeft className="h-5 w-5" />
        </BotonPagina>
        <BotonPagina onClick={() => onCambiar(pagina + 1)} disabled={enUltimaPagina} ariaLabel="Página siguiente">
          <ChevronRight className="h-5 w-5" />
        </BotonPagina>
        <BotonPagina onClick={() => onCambiar(totalPaginas)} disabled={enUltimaPagina} ariaLabel="Última página">
          <ChevronsRight className="h-5 w-5" />
        </BotonPagina>
      </div>
    </div>
  );
}

export default Paginacion;