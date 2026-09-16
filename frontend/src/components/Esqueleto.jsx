// Bloque de esqueleto de carga: un rectángulo con pulso suave, para
// aproximar la forma del contenido real mientras llega. Se compone con
// className (ancho/alto) desde cada pantalla, según lo que esté cargando.

function Esqueleto({ className = '' }) {
  return <div className={`animate-pulse rounded-[var(--radius-control)] bg-borde ${className}`} aria-hidden="true" />;
}

export default Esqueleto;
