// Card de sección reutilizada en la ficha de detalle de una persona.

function SeccionDetalle({ icono: Icono, titulo, cantidad, mensajeVacio, children }) {
  const hayContenido = cantidad > 0;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icono className="h-5.5 w-5.5" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{titulo}</h3>
        {hayContenido && (
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500">
            {cantidad}
          </span>
        )}
      </div>

      {hayContenido ? children : <p className="text-base text-slate-400">{mensajeVacio}</p>}
    </section>
  );
}

export default SeccionDetalle;