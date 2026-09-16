// Notificaciones de confirmación: mensajes breves que aparecen abajo a la
// derecha y se cierran solos. Un solo hook, useToast: "const notificar =
// useToast(); notificar('Correo agregado.')". No bloquean nada (a
// diferencia del modal de confirmación) — son un aviso, no una pregunta.

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const DURACION_MS = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const siguienteId = useRef(0);

  const quitar = useCallback((id) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
  }, []);

  // tipo: 'exito' (default) | 'error'. La mayoría de los usos de este
  // sistema son confirmaciones de éxito; 'error' existe para los pocos
  // casos donde algo falló después de que la persona ya cerró de vista
  // el formulario que lo hubiera mostrado inline.
  const notificar = useCallback(
    (mensaje, { tipo = 'exito' } = {}) => {
      const id = siguienteId.current++;
      setToasts((actuales) => [...actuales, { id, mensaje, tipo }]);
      setTimeout(() => quitar(id), DURACION_MS);
    },
    [quitar]
  );

  return (
    <ToastContext.Provider value={notificar}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-control)] border bg-hoja px-4 py-3 text-sm shadow-none motion-safe:animate-[entrar-toast_180ms_ease-out] ${
              toast.tipo === 'error' ? 'border-destructivo text-destructivo' : 'border-borde text-texto'
            }`}
          >
            <p className="flex-1">{toast.mensaje}</p>
            <button
              type="button"
              onClick={() => quitar(toast.id)}
              aria-label="Cerrar notificación"
              className="shrink-0 text-texto-secundario outline-none hover:text-texto focus-visible:ring-2 focus-visible:ring-acento"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);

  if (!contexto) {
    throw new Error('useToast debe usarse dentro de un ToastProvider.');
  }

  return contexto;
}
