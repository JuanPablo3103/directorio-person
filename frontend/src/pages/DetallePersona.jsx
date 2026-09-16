// Página de detalle de una persona (ruta "/personas/:id"): datos
// básicos, correos, teléfonos y direcciones.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerPersonaPorId, eliminarPersona } from '../api/personas.api';
import clienteApi from '../api/client';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';
import Encabezado from '../components/Encabezado';

function DetallePersona() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [error, setError] = useState('');

  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // Correos electrónicos: se manejan aparte de "persona" porque HU-08
  // los agrega/elimina en vivo, sin recargar el detalle completo.
  const [correos, setCorreos] = useState([]);
  const [cargandoCorreos, setCargandoCorreos] = useState(true);
  const [errorCorreos, setErrorCorreos] = useState('');

  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [agregandoCorreo, setAgregandoCorreo] = useState(false);
  const [errorAgregarCorreo, setErrorAgregarCorreo] = useState('');

  const [eliminandoCorreoId, setEliminandoCorreoId] = useState(null);

  // Se vuelve a cargar cada vez que cambia el id de la URL (por ejemplo,
  // si el usuario navega de un detalle a otro sin pasar por el listado).
  useEffect(() => {
    let cancelado = false;

    async function cargarPersona() {
      setCargando(true);
      setNoEncontrada(false);
      setError('');

      try {
        const datosPersona = await obtenerPersonaPorId(id);
        if (!cancelado) {
          setPersona(datosPersona);
        }
      } catch (errorPeticion) {
        if (cancelado) return;

        if (errorPeticion.response?.status === 404) {
          setNoEncontrada(true);
        } else {
          setError('No se pudo cargar la información de la persona. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarPersona();

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Carga los correos por separado, contra el endpoint propio de HU-08
  // (GET /api/personas/:id/correos), no desde el detalle embebido.
  useEffect(() => {
    let cancelado = false;

    async function cargarCorreos() {
      setCargandoCorreos(true);
      setErrorCorreos('');

      try {
        const respuesta = await clienteApi.get(`/personas/${id}/correos`);
        if (!cancelado) {
          setCorreos(respuesta.data);
        }
      } catch {
        if (!cancelado) {
          setErrorCorreos('No se pudieron cargar los correos. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargandoCorreos(false);
        }
      }
    }

    cargarCorreos();

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function manejarAgregarCorreo(evento) {
    evento.preventDefault();
    setErrorAgregarCorreo('');
    setAgregandoCorreo(true);

    try {
      const respuesta = await clienteApi.post(`/personas/${id}/correos`, {
        correo: nuevoCorreo.trim()
      });

      setCorreos((correosActuales) => [...correosActuales, respuesta.data]);
      setNuevoCorreo('');
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 400 || errorPeticion.response?.status === 409) {
        setErrorAgregarCorreo(
          errorPeticion.response.data?.mensaje ?? 'No se pudo agregar el correo.'
        );
      } else if (!errorPeticion.response) {
        setErrorAgregarCorreo('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setErrorAgregarCorreo('Ocurrió un error inesperado al agregar el correo.');
      }
    } finally {
      setAgregandoCorreo(false);
    }
  }

  async function manejarEliminarCorreo(correo) {
    const confirmado = window.confirm('¿Eliminar este correo?');

    if (!confirmado) {
      return;
    }

    setErrorCorreos('');
    setEliminandoCorreoId(correo.emailAddressId);

    try {
      await clienteApi.delete(`/personas/${id}/correos/${correo.emailAddressId}`);
      setCorreos((correosActuales) =>
        correosActuales.filter((c) => c.emailAddressId !== correo.emailAddressId)
      );
    } catch {
      setErrorCorreos('No se pudo eliminar el correo. Intenta nuevamente.');
    } finally {
      setEliminandoCorreoId(null);
    }
  }

  async function manejarEliminar() {
    const confirmado = window.confirm(
      `¿Eliminar a ${persona.nombreCompleto}? Esta acción no se puede deshacer.`
    );

    if (!confirmado) {
      return;
    }

    setErrorEliminar('');
    setEliminando(true);

    try {
      await eliminarPersona(id);
      navigate('/', { replace: true });
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 404) {
        // Ya no existe (por ejemplo, la borraron desde otra sesión):
        // el resultado que el usuario espera es el mismo que si hubiera
        // tenido éxito, así que se navega igual al listado.
        navigate('/', { replace: true });
        return;
      }

      if (errorPeticion.response?.status === 409) {
        setErrorEliminar(
          errorPeticion.response.data?.mensaje ??
            'No se puede eliminar esta persona porque tiene registros asociados en otras áreas del sistema.'
        );
      } else if (!errorPeticion.response) {
        setErrorEliminar('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setErrorEliminar('Ocurrió un error inesperado al eliminar la persona. Intenta nuevamente.');
      }

      setEliminando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Encabezado />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Siempre visible, independientemente del estado de la carga */}
          <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-800">
            ← Volver al listado
          </Link>

          {!cargando && !noEncontrada && !error && persona && (
            <div className="flex gap-2">
              <Link
                to={`/personas/${id}/editar`}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Editar
              </Link>
              <button
                type="button"
                onClick={manejarEliminar}
                disabled={eliminando}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>

        {errorEliminar && (
          <p
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {errorEliminar}
          </p>
        )}

        {cargando && (
          <div className="mt-6 rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
            Cargando...
          </div>
        )}

        {!cargando && noEncontrada && (
          <div className="mt-6 rounded-lg bg-white p-8 text-center shadow-md">
            <p className="text-lg font-medium text-gray-800">Persona no encontrada</p>
            <p className="mt-1 text-sm text-gray-500">
              No existe ninguna persona con el identificador {id}.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Volver al listado
            </Link>
          </div>
        )}

        {!cargando && !noEncontrada && error && (
          <div className="mt-6 rounded-lg bg-white p-8 text-center text-red-600 shadow-md">
            {error}
          </div>
        )}

        {!cargando && !noEncontrada && !error && persona && (
          <div className="mt-6 space-y-4">
            {/* 1. Datos de la persona */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800">{persona.nombreCompleto}</h2>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-gray-500">Tipo:</dt>
                  <dd className="text-gray-800">
                    {ETIQUETAS_TIPO[persona.PersonType] ?? persona.PersonType}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">Identificador:</dt>
                  <dd className="text-gray-800">{persona.BusinessEntityID}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">Acepta promociones por correo:</dt>
                  <dd className="text-gray-800">{persona.EmailPromotion > 0 ? 'Sí' : 'No'}</dd>
                </div>
              </dl>
            </section>

            {/* 2. Correos electrónicos */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Correos electrónicos
              </h3>

              {cargandoCorreos ? (
                <p className="mt-2 text-sm text-gray-500">Cargando correos...</p>
              ) : (
                <>
                  {errorCorreos && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errorCorreos}
                    </p>
                  )}

                  {correos.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">No tiene correos registrados.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm text-gray-800">
                      {correos.map((correo) => (
                        <li key={correo.emailAddressId} className="flex items-center justify-between gap-2">
                          <span>{correo.correo}</span>
                          <button
                            type="button"
                            onClick={() => manejarEliminarCorreo(correo)}
                            disabled={eliminandoCorreoId === correo.emailAddressId}
                            className="text-xs font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {eliminandoCorreoId === correo.emailAddressId ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form onSubmit={manejarAgregarCorreo} className="mt-3 flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={nuevoCorreo}
                        onChange={(evento) => setNuevoCorreo(evento.target.value)}
                        placeholder="nuevo.correo@ejemplo.com"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      />
                      {errorAgregarCorreo && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errorAgregarCorreo}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={agregandoCorreo}
                      className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {agregandoCorreo ? 'Agregando...' : 'Agregar'}
                    </button>
                  </form>
                </>
              )}
            </section>

            {/* 3. Teléfonos */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Teléfonos
              </h3>
              {persona.telefonos.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No tiene teléfonos registrados.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-gray-800">
                  {persona.telefonos.map((telefono) => (
                    <li key={`${telefono.PhoneNumber}-${telefono.PhoneNumberTypeID}`}>
                      {telefono.PhoneNumber}{' '}
                      <span className="text-gray-500">({telefono.tipoTelefono})</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 4. Direcciones */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Direcciones
              </h3>
              {persona.direcciones.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No tiene direcciones registradas.</p>
              ) : (
                <ul className="mt-2 space-y-3 text-sm">
                  {persona.direcciones.map((direccion) => (
                    <li
                      key={direccion.AddressID}
                      className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="font-medium text-gray-800">{direccion.tipoDireccion}</p>
                      <p className="text-gray-600">
                        {direccion.AddressLine1}
                        {direccion.AddressLine2 ? `, ${direccion.AddressLine2}` : ''}
                      </p>
                      <p className="text-gray-600">
                        {direccion.City}, {direccion.estadoProvincia}, {direccion.pais}
                      </p>
                      <p className="text-gray-600">{direccion.PostalCode}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default DetallePersona;
