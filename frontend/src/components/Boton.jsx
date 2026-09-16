// Botón reutilizable con variantes consistentes en toda la app, para no
// repetir clases de Tailwind distintas en cada pantalla.

const VARIANTES = {
  primario: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secundario: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline-brand-600',
  peligro: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
  fantasma: 'text-slate-600 hover:bg-slate-100 focus-visible:outline-brand-600'
};

function Boton({ variante = 'primario', icono: Icono, className = '', children, ...resto }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
      {...resto}
    >
      {Icono && <Icono className="h-4 w-4" strokeWidth={2} />}
      {children}
    </button>
  );
}

export default Boton;