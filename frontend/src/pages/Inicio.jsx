// Pantalla de inicio (ruta "/"): el número total de personas y la
// composición del directorio por tipo, como una sola barra proporcional
// que además funciona como navegación (cada segmento filtra el listado).
//
// No hay <h1> acá adentro: la barra de contexto del Shell ya muestra
// "Inicio" como título de la pantalla. Repetirlo sería la misma
// redundancia que encontramos y corregimos en el logotipo del login.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clienteApi from '../api/client';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';

const formatearNumero = (numero) => numero.toLocaleString('es-AR');

function Inicio() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function cargarEstadisticas() {
      setCargando(true);
      setError('');

      try {
        const respuesta = await clienteApi.get('/estadisticas');
        if (!cancelado) {
          setEstadisticas(respuesta.data);
        }
      } catch {
        if (!cancelado) {
          setError('No se pudieron cargar los indicadores. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarEstadisticas();

    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) {
    return <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-texto-secundario">Cargando...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-destructivo">{error}</div>;
  }

  // Solo los tipos con al menos una persona: no tiene sentido un segmento
  // ni una fila de leyenda para algo que no existe en el directorio.
  // Ordenados de mayor a menor: el orden de la leyenda hace de "clave de
  // color" (no hace falta pintar cada tipo distinto para identificarlo).
  const segmentos = Object.entries(estadisticas.porTipo)
    .map(([tipo, cantidad]) => ({ tipo, cantidad, etiqueta: ETIQUETAS_TIPO[tipo] }))
    .filter((segmento) => segmento.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <span className="font-display text-[clamp(3.5rem,9vw,6.5rem)] leading-none font-semibold tabular-nums text-texto">
          {formatearNumero(estadisticas.totalPersonas)}
        </span>
        <span className="text-sm text-texto-secundario">personas en el directorio</span>
      </div>

      {/* La barra: cada segmento es un enlace al listado ya filtrado por
          ese tipo. El ancho es proporcional de verdad (flex-grow con la
          cantidad real), no una aproximación visual. */}
      <div className="mt-8 flex h-8 gap-px overflow-hidden rounded-[var(--radius-control)]" role="list">
        {segmentos.map((segmento) => (
          <Link
            key={segmento.tipo}
            to={`/personas?tipo=${segmento.tipo}`}
            role="listitem"
            title={`${segmento.etiqueta}: ${formatearNumero(segmento.cantidad)}`}
            aria-label={`Ver ${segmento.etiqueta}: ${formatearNumero(segmento.cantidad)} personas`}
            style={{ flexGrow: segmento.cantidad, flexBasis: 0, minWidth: 3 }}
            className="bg-texto/80 outline-none transition-colors hover:bg-acento focus-visible:ring-2 focus-visible:ring-acento"
          />
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {segmentos.map((segmento) => (
          <li key={segmento.tipo}>
            <Link
              to={`/personas?tipo=${segmento.tipo}`}
              className="group flex items-center gap-2 text-sm text-texto-secundario hover:text-texto"
            >
              <span className="h-2 w-2 shrink-0 bg-texto/80 group-hover:bg-acento" aria-hidden="true" />
              {segmento.etiqueta}
              <span className="font-mono tabular-nums text-texto">
                {formatearNumero(segmento.cantidad)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-borde pt-6">
        <div>
          <p className="text-xs text-texto-secundario">Correos</p>
          <p className="font-mono text-lg tabular-nums text-texto">
            {formatearNumero(estadisticas.totalCorreos)}
          </p>
        </div>
        <div>
          <p className="text-xs text-texto-secundario">Teléfonos</p>
          <p className="font-mono text-lg tabular-nums text-texto">
            {formatearNumero(estadisticas.totalTelefonos)}
          </p>
        </div>
        <div>
          <p className="text-xs text-texto-secundario">Direcciones</p>
          <p className="font-mono text-lg tabular-nums text-texto">
            {formatearNumero(estadisticas.totalDirecciones)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Inicio;
