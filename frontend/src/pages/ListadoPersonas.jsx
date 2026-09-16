// Página de listado de personas (ruta "/"): tabla paginada con búsqueda
// por nombre/apellido y filtro por tipo de persona.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, Mail, Briefcase, ChevronRight } from 'lucide-react';
import { listarPersonas } from '../api/personas.api';
import { OPCIONES_TIPO } from '../constants/tiposPersona';
import Encabezado from '../components/Encabezado';
import Insignia from '../components/Insignia';
import Avatar from '../components/Avatar';
import Paginacion from '../components/Paginacion';

const LIMITE = 20;

function TarjetaEstadistica({ icono: Icono, etiqueta, valor, clases }) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${clases}`}>
        <Icono className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{etiqueta}</p>
        <p className="text-3xl font-bold text-slate-800">{valor}</p>
      </div>
    </div>
  );
}

function FilaEsqueleto() {
  return (
    <tr className="border-b border-slate-100">
      {[0, 1, 2, 3].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-5 w-full max-w-[12rem] animate-pulse-soft rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

function ListadoPersonas() {
  const navigate = useNavigate();

  const [buscarInput, setBuscarInput] = useState('');
  const [buscar, setBuscar] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);

  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscar(buscarInput.trim());
      setPagina(1);
    }, 400);

    return () => clearTimeout(temporizador);
  }, [buscarInput]);

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

  const conCorreo = datos.filter((p) => p.correo).length;
  const empleados = datos.filter((p) => p.PersonType === 'EM').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Encabezado />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Directorio de personas</h1>
            <p className="mt-2 text-base text-slate-500">
              Consulta, registra y administra los contactos del sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/personas/nueva')}
            className="inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
          >
            <UserPlus className="h-5 w-5" />
            Registrar persona
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <TarjetaEstadistica
            icono={Users}
            etiqueta="Total encontrados"
            valor={total}
            clases="bg-brand-50 text-brand-600"
          />
          <TarjetaEstadistica
            icono={Mail}
            etiqueta="Con correo (pág. actual)"
            valor={conCorreo}
            clases="bg-emerald-50 text-emerald-600"
          />
          <TarjetaEstadistica
            icono={Briefcase}
            etiqueta="Empleados (pág. actual)"
            valor={empleados}
            clases="bg-amber-50 text-amber-600"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 p-6">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={buscarInput}
                onChange={(evento) => setBuscarInput(evento.target.value)}
                placeholder="Buscar por nombre o apellido..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-base text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <select
              value={tipo}
              onChange={manejarCambioTipo}
              className="rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              {OPCIONES_TIPO.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Persona</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Correo</th>
                  <th className="px-6 py-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {cargando && Array.from({ length: 6 }).map((_, i) => <FilaEsqueleto key={i} />)}

                {!cargando && error && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-base text-rose-600">
                      {error}
                    </td>
                  </tr>
                )}

                {!cargando && !error && datos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <Users className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-lg font-medium text-slate-600">No se encontraron personas</p>
                      <p className="text-base text-slate-400">Prueba con otros criterios de búsqueda.</p>
                    </td>
                  </tr>
                )}

                {!cargando &&
                  !error &&
                  datos.map((persona) => (
                    <tr
                      key={persona.BusinessEntityID}
                      onClick={() => navigate(`/personas/${persona.BusinessEntityID}`)}
                      className="group cursor-pointer border-b border-slate-50 transition-colors last:border-0 hover:bg-brand-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar nombre={persona.nombreCompleto} tamano="sm" />
                          <div>
                            <p className="text-base font-medium text-slate-800">{persona.nombreCompleto}</p>
                            <p className="text-sm text-slate-400">ID #{persona.BusinessEntityID}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Insignia tipo={persona.PersonType} />
                      </td>
                      <td className="px-6 py-4 text-base text-slate-600">{persona.correo || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="ml-auto h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Paginacion pagina={pagina} totalPaginas={totalPaginas} total={total} onCambiar={setPagina} />
        </div>
      </main>
    </div>
  );
}

export default ListadoPersonas;