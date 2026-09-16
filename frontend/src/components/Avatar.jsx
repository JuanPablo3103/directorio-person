// Círculo con las iniciales de un nombre. Se usa como avatar tanto en el
// encabezado (usuario conectado) como en el listado y detalle de personas.

const PALETA = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700'
];

function obtenerIniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function obtenerColor(nombre = '') {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETA[Math.abs(hash) % PALETA.length];
}

function Avatar({ nombre, tamano = 'md' }) {
  const clasesTamano =
    tamano === 'lg'
      ? 'h-20 w-20 text-2xl'
      : tamano === 'sm'
        ? 'h-10 w-10 text-sm'
        : 'h-12 w-12 text-base';

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${clasesTamano} ${obtenerColor(nombre)}`}
    >
      {obtenerIniciales(nombre)}
    </div>
  );
}

export default Avatar;