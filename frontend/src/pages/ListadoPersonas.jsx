// Página de listado de personas (ruta "/personas"): tabla paginada con
// búsqueda por nombre/apellido y filtro por tipo de persona.
//
// Sin tarjeta blanca ni sombra alrededor de la tabla: la separación entre
// filas es un filete (border-borde), no un contenedor flotante. La fila
// activa (hover o foco de teclado) se marca con un tick ámbar a la
// izquierda, el mismo lenguaje que ya usa el riel de navegación para
// indicar posición.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listarPersonas } from '../api/personas.api';
import { ETIQUETAS_TIPO, OPCIONES_TIPO } from '../constants/tiposPersona';

const LIMITE = 20;

function ListadoPersonas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Texto que el usuario está escribiendo, sin filtrar todavía.
  const [buscarInput, setBuscarInput] = useState('');
  // Texto ya "asentado" tras el retardo, el que realmente se envía a la API.
  const [buscar, setBuscar] = useState('');
  // Si se llega acá con "?tipo=XX" en la URL (por ejemplo, desde un
  // segmento de la barra de Inicio), ese es el filtro inicial.
  const [tipo, setTipo] = useState(() => searchParams.get('tipo') ?? '');
  const [pagina, setPagina] = useState(1);

  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Espera 400 ms sin que el usuario escriba antes de "confirmar" el
  // término de búsqueda y volver a la página 1. Evita una petición por
  // cada tecla presionada.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscar(buscarInput.trim());
      setPagina(1);
    }, 400);

    return () => clearTimeout(temporizador);
  }, [buscarInput]);

  // Carga el listado cada vez que cambia la página, la búsqueda ya
  // confirmada o el tipo. "cancelado" evita pisar el estado con la
  // respuesta de una petición vieja si el usuario siguió escribiendo.
  useEffect(() => {
    let cancelado = false;

    async function cargarPersonas() {
      setCargando(true);
      setError('');

      try {
        const resultado = await listarPersonas({
          pagina,
          limite: LIMITE,
          buscar: buscar || undefined,
          tipo: tipo || undefined
        });

        if (!cancelado) {
          setDatos(resultado.datos);
          setTotal(resultado.total);
          setTotalPaginas(resultado.totalPaginas);
        }
      } catch {
        if (!cancelado) {
          setError('No se pudo cargar el listado de personas. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarPersonas();

    return () => {
      cancelado = true;
    };
  }, [pagina, buscar, tipo]);

  function manejarCambioTipo(evento) {
    setTipo(evento.target.value);
    setPagina(1);
  }

  const enPrimeraPagina = pagina <= 1;
  const enUltimaPagina = totalPaginas === 0 || pagina >= totalPaginas;

  const campoBusqueda = (
    <input
      type="text"
      value={buscarInput}
      onChange={(evento) => setBuscarInput(evento.target.value)}
      placeholder="Buscar por nombre o apellido"
      className="w-full max-w-xs rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-2 text-sm text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-acento"
    />
  );

  const selectorTipo = (
    <select
      value={tipo}
      onChange={manejarCambioTipo}
      className="rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-2 text-sm text-texto outline-none focus-visible:ring-2 focus-visible:ring-acento"
    >
      {OPCIONES_TIPO.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {campoBusqueda}
          {selectorTipo}
        </div>

        <button
          type="button"
          onClick={() => navigate('/personas/nueva')}
          className="rounded-[var(--radius-control)] bg-acento px-4 py-2 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie"
        >
          Registrar persona
        </button>
      </div>

      {cargando && <p className="py-10 text-center text-sm text-texto-secundario">Cargando...</p>}

      {!cargando && error && <p className="py-10 text-center text-sm text-destructivo">{error}</p>}

      {!cargando && !error && datos.length === 0 && (
        <p className="py-10 text-center text-sm text-texto-secundario">
          No encontramos a nadie con esos criterios. Probá con otro nombre o cambiá el filtro de tipo.
        </p>
      )}

      {!cargando && !error && datos.length > 0 && (
        <>
          {/* Tabla: desde md hacia arriba. */}
          <table className="hidden w-full border-collapse text-left text-sm md:table">
            <thead>
              <tr className="border-b border-borde text-texto-secundario">
                <th className="py-2 pr-4 pl-4 font-normal">Nombre completo</th>
                <th className="py-2 pr-4 font-normal">Tipo</th>
                <th className="py-2 pr-4 font-normal">Correo</th>
                <th className="py-2 pr-0 text-right font-normal">ID</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((persona) => (
                <tr
                  key={persona.BusinessEntityID}
                  onClick={() => navigate(`/personas/${persona.BusinessEntityID}`)}
                  className="group cursor-pointer border-b border-borde last:border-0 hover:bg-hoja"
                >
                  <td className="relative py-3 pr-4 pl-4 text-texto">
                    <span
                      className="absolute inset-y-0 left-0 w-[3px] bg-acento opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      aria-hidden="true"
                    />
                    <Link
                      to={`/personas/${persona.BusinessEntityID}`}
                      onClick={(evento) => evento.stopPropagation()}
                      className="rounded-[var(--radius-control)] outline-none focus-visible:ring-2 focus-visible:ring-acento"
                    >
                      {persona.nombreCompleto}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-texto-secundario">
                    {ETIQUETAS_TIPO[persona.PersonType] ?? persona.PersonType}
                  </td>
                  <td className="py-3 pr-4 text-texto-secundario">{persona.correo || '—'}</td>
                  <td className="py-3 pr-0 text-right font-mono text-xs tabular-nums text-texto-secundario">
                    {persona.BusinessEntityID}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tarjetas: por debajo de md, la tabla se vuelve ilegible en
              columnas angostas, así que cada persona pasa a ser un bloque
              apilado en vez de una fila. */}
          <ul className="md:hidden">
            {datos.map((persona) => (
              <li key={persona.BusinessEntityID} className="border-b border-borde py-3 last:border-0">
                <Link
                  to={`/personas/${persona.BusinessEntityID}`}
                  className="flex items-start justify-between gap-3 rounded-[var(--radius-control)] outline-none focus-visible:ring-2 focus-visible:ring-acento"
                >
                  <div>
                    <p className="text-sm text-texto">{persona.nombreCompleto}</p>
                    <p className="mt-0.5 text-sm text-texto-secundario">
                      {ETIQUETAS_TIPO[persona.PersonType] ?? persona.PersonType}
                    </p>
                    <p className="mt-0.5 text-sm text-texto-secundario">{persona.correo || '—'}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-texto-secundario">
                    {persona.BusinessEntityID}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-texto-secundario">
            <span>
              Página {pagina} de {totalPaginas} · {total.toLocaleString('es-AR')} registros
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPagina(1)}
                disabled={enPrimeraPagina}
                className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-40"
              >
                Primera
              </button>
              <button
                type="button"
                onClick={() => setPagina((paginaActual) => paginaActual - 1)}
                disabled={enPrimeraPagina}
                className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPagina((paginaActual) => paginaActual + 1)}
                disabled={enUltimaPagina}
                className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
              <button
                type="button"
                onClick={() => setPagina(totalPaginas)}
                disabled={enUltimaPagina}
                className="rounded-[var(--radius-control)] border border-borde px-3 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-40"
              >
                Última
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ListadoPersonas;
