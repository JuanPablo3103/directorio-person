// Modal de confirmación, para reemplazar los window.confirm() nativos
// (que no tienen identidad visual ni respetan el tema) por un diálogo
// propio. Expone un solo hook, useConfirm, que devuelve una función
// async: "const confirmar = useConfirm(); const ok = await confirmar({...})".
// Quien la llama no necesita saber nada del modal en sí, solo esperar
// el booleano — mismo espíritu que window.confirm(), pero propio.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [solicitud, setSolicitud] = useState(null);
  const resolverRef = useRef(null);
  const botonCancelarRef = useRef(null);

  const confirmar = useCallback((opciones) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setSolicitud({
        titulo: opciones.titulo,
        descripcion: opciones.descripcion,
        textoConfirmar: opciones.textoConfirmar ?? 'Confirmar',
        textoCancelar: opciones.textoCancelar ?? 'Cancelar',
        destructivo: opciones.destructivo ?? false
      });
    });
  }, []);

  function responder(resultado) {
    resolverRef.current?.(resultado);
    resolverRef.current = null;
    setSolicitud(null);
  }

  // Enfoca "Cancelar" al abrir: para una acción destructiva, que Enter no
  // confirme por accidente es más seguro que enfocar "Eliminar".
  useEffect(() => {
    if (solicitud) {
      botonCancelarRef.current?.focus();
    }
  }, [solicitud]);

  // Escape cancela, igual que window.confirm().
  useEffect(() => {
    if (!solicitud) return;

    function manejarTecla(evento) {
      if (evento.key === 'Escape') {
        responder(false);
      }
    }

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [solicitud]);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}

      {solicitud && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-tinta/50"
            onClick={() => responder(false)}
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmar-titulo"
            aria-describedby="confirmar-descripcion"
            className="relative w-full max-w-sm rounded-[var(--radius-control)] border border-borde bg-hoja p-5 motion-safe:animate-[aparecer_160ms_ease-out]"
          >
            <h2 id="confirmar-titulo" className="text-base font-semibold text-texto">
              {solicitud.titulo}
            </h2>
            {solicitud.descripcion && (
              <p id="confirmar-descripcion" className="mt-2 text-sm text-texto-secundario">
                {solicitud.descripcion}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={botonCancelarRef}
                type="button"
                onClick={() => responder(false)}
                className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 text-sm font-medium text-texto outline-none hover:bg-superficie focus-visible:ring-2 focus-visible:ring-acento"
              >
                {solicitud.textoCancelar}
              </button>
              <button
                type="button"
                onClick={() => responder(true)}
                className={
                  solicitud.destructivo
                    ? 'rounded-[var(--radius-control)] border border-destructivo px-3 py-1.5 text-sm font-medium text-destructivo outline-none hover:bg-destructivo hover:text-papel focus-visible:ring-2 focus-visible:ring-acento'
                    : 'rounded-[var(--radius-control)] bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento'
                }
              >
                {solicitud.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const contexto = useContext(ConfirmContext);

  if (!contexto) {
    throw new Error('useConfirm debe usarse dentro de un ConfirmProvider.');
  }

  return contexto;
}
