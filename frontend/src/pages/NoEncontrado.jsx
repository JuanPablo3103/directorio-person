// Pantalla 404: cualquier ruta que no coincida con nada, dentro del
// Shell (ver App.jsx, ruta "*" como último hijo del grupo protegido).
// Sigue el mismo lenguaje visual que Inicio para la cifra grande, porque
// acá la cifra ES el contenido — no hace falta decorar más.

import { Link } from 'react-router-dom';

function NoEncontrado() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="font-display text-[clamp(4rem,12vw,7rem)] leading-none font-semibold tabular-nums text-texto">
        404
      </span>
      <p className="mt-4 text-lg font-medium text-texto">Esta página no existe</p>
      <p className="mt-2 text-sm text-texto-secundario">
        Puede que el enlace esté roto o que la dirección tenga un error de tipeo.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-[var(--radius-control)] bg-acento px-4 py-2 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default NoEncontrado;
