// Página de listado de personas (ruta "/"): tabla paginada con búsqueda
// por nombre/apellido y filtro por tipo de persona.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarPersonas } from '../api/personas.api';
import { ETIQUETAS_TIPO, OPCIONES_TIPO } from '../constants/tiposPersona';
import Encabezado from '../components/Encabezado';

const LIMITE = 20;

function ListadoPersonas() {
  const navigate = useNavigate();

  // Texto que el usuario está escribiendo, sin filtrar todavía.
  const [buscarInput, setBuscarInput] = useState('');
  // Texto ya "asentado" tras el retardo, el que realmente se envía a la API.
  const [buscar, setBuscar] = useState('');
  const [tipo, setTipo] = useState('');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Encabezado />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={buscarInput}
            onChange={(evento) => setBuscarInput(evento.target.value)}
            placeholder="Buscar por nombre o apellido..."
            className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
          />

          <select
            value={tipo}
            onChange={manejarCambioTipo}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
          >
            {OPCIONES_TIPO.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Nombre completo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Correo</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              )}

              {!cargando && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!cargando && !error && datos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No se encontraron personas con esos criterios.
                  </td>
                </tr>
              )}

              {!cargando &&
                !error &&
                datos.map((persona) => (
                  <tr
                    key={persona.BusinessEntityID}
                    onClick={() => navigate(`/personas/${persona.BusinessEntityID}`)}
                    className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800">{persona.BusinessEntityID}</td>
                    <td className="px-4 py-3 text-gray-800">{persona.nombreCompleto}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {ETIQUETAS_TIPO[persona.PersonType] ?? persona.PersonType}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{persona.correo || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
          <span>
            Página {totalPaginas === 0 ? 0 : pagina} de {totalPaginas} · {total} registros encontrados
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagina(1)}
              disabled={enPrimeraPagina}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Primera
            </button>
            <button
              type="button"
              onClick={() => setPagina((paginaActual) => paginaActual - 1)}
              disabled={enPrimeraPagina}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((paginaActual) => paginaActual + 1)}
              disabled={enUltimaPagina}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
            <button
              type="button"
              onClick={() => setPagina(totalPaginas)}
              disabled={enUltimaPagina}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Última
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListadoPersonas;
