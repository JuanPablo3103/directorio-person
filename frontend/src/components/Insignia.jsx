// Insignia (badge) que muestra la etiqueta legible de un tipo de persona
// con un color asociado.

import { ETIQUETAS_TIPO, COLORES_TIPO } from '../constants/tiposPersona';

function Insignia({ tipo }) {
  const etiqueta = ETIQUETAS_TIPO[tipo] ?? tipo;
  const clasesColor = COLORES_TIPO[tipo] ?? 'bg-slate-100 text-slate-700 ring-slate-600/20';

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${clasesColor}`}
    >
      {etiqueta}
    </span>
  );
}

export default Insignia;