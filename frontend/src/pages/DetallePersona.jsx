// Página de detalle de una persona (ruta "/personas/:id"): datos
// básicos, correos, teléfonos y direcciones.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerPersonaPorId, eliminarPersona } from '../api/personas.api';
import clienteApi from '../api/client';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';

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

  // Teléfonos: mismo patrón que correos (HU-08), pero la clave para saber
  // "cuál se está borrando" es compuesta (numero + tipoId), porque la
  // tabla no tiene una columna autoincremental propia.
  const [telefonos, setTelefonos] = useState([]);
  const [cargandoTelefonos, setCargandoTelefonos] = useState(true);
  const [errorTelefonos, setErrorTelefonos] = useState('');

  const [tiposTelefono, setTiposTelefono] = useState([]);
  const [cargandoTiposTelefono, setCargandoTiposTelefono] = useState(true);

  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevoTipoId, setNuevoTipoId] = useState('');
  const [agregandoTelefono, setAgregandoTelefono] = useState(false);
  const [errorAgregarTelefono, setErrorAgregarTelefono] = useState('');

  const [eliminandoTelefonoClave, setEliminandoTelefonoClave] = useState(null);

  // Direcciones: mismo patrón que correos y teléfonos, pero HU-10/HU-11
  // son solo de consulta y alta (no hay eliminación en esta historia).
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoDirecciones, setCargandoDirecciones] = useState(true);
  const [errorDirecciones, setErrorDirecciones] = useState('');

  const [tiposDireccion, setTiposDireccion] = useState([]);
  const [cargandoTiposDireccion, setCargandoTiposDireccion] = useState(true);

  const [estados, setEstados] = useState([]);
  const [cargandoEstados, setCargandoEstados] = useState(true);

  const [nuevaDireccion, setNuevaDireccion] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvinceId: '',
    postalCode: '',
    addressTypeId: ''
  });
  const [agregandoDireccion, setAgregandoDireccion] = useState(false);
  const [errorAgregarDireccion, setErrorAgregarDireccion] = useState('');

  const [eliminandoDireccionId, setEliminandoDireccionId] = useState(null);

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

  // Carga los teléfonos por separado, contra el endpoint propio de HU-09
  // (GET /api/personas/:id/telefonos), no desde el detalle embebido.
  useEffect(() => {
    let cancelado = false;

    async function cargarTelefonos() {
      setCargandoTelefonos(true);
      setErrorTelefonos('');

      try {
        const respuesta = await clienteApi.get(`/personas/${id}/telefonos`);
        if (!cancelado) {
          setTelefonos(respuesta.data);
        }
      } catch {
        if (!cancelado) {
          setErrorTelefonos('No se pudieron cargar los teléfonos. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargandoTelefonos(false);
        }
      }
    }

    cargarTelefonos();

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Catálogo de tipos de teléfono para el <select> del formulario. No
  // depende de "id": se carga una sola vez al montar el componente.
  useEffect(() => {
    let cancelado = false;

    async function cargarTiposTelefono() {
      setCargandoTiposTelefono(true);

      try {
        const respuesta = await clienteApi.get('/catalogos/tipos-telefono');
        if (!cancelado) {
          setTiposTelefono(respuesta.data);
        }
      } catch {
        // Si falla, el select queda vacío y el usuario no podrá agregar
        // teléfonos hasta refrescar; no bloquea el resto del detalle.
      } finally {
        if (!cancelado) {
          setCargandoTiposTelefono(false);
        }
      }
    }

    cargarTiposTelefono();

    return () => {
      cancelado = true;
    };
  }, []);

  async function manejarAgregarTelefono(evento) {
    evento.preventDefault();
    setErrorAgregarTelefono('');

    if (!nuevoTipoId) {
      setErrorAgregarTelefono('Selecciona un tipo de teléfono.');
      return;
    }

    setAgregandoTelefono(true);

    try {
      const respuesta = await clienteApi.post(`/personas/${id}/telefonos`, {
        numero: nuevoNumero.trim(),
        tipoId: Number(nuevoTipoId)
      });

      setTelefonos((telefonosActuales) => [...telefonosActuales, respuesta.data]);
      setNuevoNumero('');
      setNuevoTipoId('');
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 400 || errorPeticion.response?.status === 409) {
        setErrorAgregarTelefono(
          errorPeticion.response.data?.mensaje ?? 'No se pudo agregar el teléfono.'
        );
      } else if (!errorPeticion.response) {
        setErrorAgregarTelefono('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setErrorAgregarTelefono('Ocurrió un error inesperado al agregar el teléfono.');
      }
    } finally {
      setAgregandoTelefono(false);
    }
  }

  async function manejarEliminarTelefono(telefono) {
    const confirmado = window.confirm('¿Eliminar este teléfono?');

    if (!confirmado) {
      return;
    }

    const clave = `${telefono.numero}-${telefono.tipoId}`;

    setErrorTelefonos('');
    setEliminandoTelefonoClave(clave);

    try {
      await clienteApi.delete(`/personas/${id}/telefonos`, {
        params: { numero: telefono.numero, tipoId: telefono.tipoId }
      });

      setTelefonos((telefonosActuales) =>
        telefonosActuales.filter(
          (t) => !(t.numero === telefono.numero && t.tipoId === telefono.tipoId)
        )
      );
    } catch {
      setErrorTelefonos('No se pudo eliminar el teléfono. Intenta nuevamente.');
    } finally {
      setEliminandoTelefonoClave(null);
    }
  }

  // Carga las direcciones por separado, contra el endpoint propio de
  // HU-10 (GET /api/personas/:id/direcciones), no desde el detalle embebido.
  useEffect(() => {
    let cancelado = false;

    async function cargarDirecciones() {
      setCargandoDirecciones(true);
      setErrorDirecciones('');

      try {
        const respuesta = await clienteApi.get(`/personas/${id}/direcciones`);
        if (!cancelado) {
          setDirecciones(respuesta.data);
        }
      } catch {
        if (!cancelado) {
          setErrorDirecciones('No se pudieron cargar las direcciones. Intenta nuevamente.');
        }
      } finally {
        if (!cancelado) {
          setCargandoDirecciones(false);
        }
      }
    }

    cargarDirecciones();

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Catálogo de tipos de dirección para el <select> del formulario. No
  // depende de "id": se carga una sola vez al montar el componente.
  useEffect(() => {
    let cancelado = false;

    async function cargarTiposDireccion() {
      setCargandoTiposDireccion(true);

      try {
        const respuesta = await clienteApi.get('/catalogos/tipos-direccion');
        if (!cancelado) {
          setTiposDireccion(respuesta.data);
        }
      } catch {
        // Si falla, el select queda vacío; no bloquea el resto del detalle.
      } finally {
        if (!cancelado) {
          setCargandoTiposDireccion(false);
        }
      }
    }

    cargarTiposDireccion();

    return () => {
      cancelado = true;
    };
  }, []);

  // Catálogo de estados/provincias (de todos los países) para el <select>
  // del formulario. Tampoco depende de "id".
  useEffect(() => {
    let cancelado = false;

    async function cargarEstados() {
      setCargandoEstados(true);

      try {
        const respuesta = await clienteApi.get('/catalogos/estados');
        if (!cancelado) {
          setEstados(respuesta.data);
        }
      } catch {
        // Si falla, el select queda vacío; no bloquea el resto del detalle.
      } finally {
        if (!cancelado) {
          setCargandoEstados(false);
        }
      }
    }

    cargarEstados();

    return () => {
      cancelado = true;
    };
  }, []);

  function actualizarCampoDireccion(campo, valor) {
    setNuevaDireccion((valoresActuales) => ({ ...valoresActuales, [campo]: valor }));
  }

  async function manejarAgregarDireccion(evento) {
    evento.preventDefault();
    setErrorAgregarDireccion('');

    if (!nuevaDireccion.stateProvinceId || !nuevaDireccion.addressTypeId) {
      setErrorAgregarDireccion('Selecciona un estado/provincia y un tipo de dirección.');
      return;
    }

    setAgregandoDireccion(true);

    try {
      const respuesta = await clienteApi.post(`/personas/${id}/direcciones`, {
        addressLine1: nuevaDireccion.addressLine1.trim(),
        addressLine2: nuevaDireccion.addressLine2.trim() || undefined,
        city: nuevaDireccion.city.trim(),
        stateProvinceId: Number(nuevaDireccion.stateProvinceId),
        postalCode: nuevaDireccion.postalCode.trim(),
        addressTypeId: Number(nuevaDireccion.addressTypeId)
      });

      setDirecciones((direccionesActuales) => [...direccionesActuales, respuesta.data]);
      setNuevaDireccion({
        addressLine1: '',
        addressLine2: '',
        city: '',
        stateProvinceId: '',
        postalCode: '',
        addressTypeId: ''
      });
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 400 || errorPeticion.response?.status === 409) {
        setErrorAgregarDireccion(
          errorPeticion.response.data?.mensaje ?? 'No se pudo agregar la dirección.'
        );
      } else if (!errorPeticion.response) {
        setErrorAgregarDireccion('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setErrorAgregarDireccion('Ocurrió un error inesperado al agregar la dirección.');
      }
    } finally {
      setAgregandoDireccion(false);
    }
  }

  async function manejarEliminarDireccion(direccion) {
    const confirmado = window.confirm('¿Eliminar esta dirección?');

    if (!confirmado) {
      return;
    }

    setErrorDirecciones('');
    setEliminandoDireccionId(direccion.addressId);

    try {
      await clienteApi.delete(`/personas/${id}/direcciones/${direccion.addressId}`);
      setDirecciones((direccionesActuales) =>
        direccionesActuales.filter((d) => d.addressId !== direccion.addressId)
      );
    } catch {
      setErrorDirecciones('No se pudo eliminar la dirección. Intenta nuevamente.');
    } finally {
      setEliminandoDireccionId(null);
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
      navigate('/personas', { replace: true });
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 404) {
        // Ya no existe (por ejemplo, la borraron desde otra sesión):
        // el resultado que el usuario espera es el mismo que si hubiera
        // tenido éxito, así que se navega igual al listado.
        navigate('/personas', { replace: true });
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
    <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Siempre visible, independientemente del estado de la carga */}
          <Link to="/personas" className="inline-block text-sm text-gray-600 hover:text-gray-800">
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
              to="/personas"
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

              {cargandoTelefonos ? (
                <p className="mt-2 text-sm text-gray-500">Cargando teléfonos...</p>
              ) : (
                <>
                  {errorTelefonos && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errorTelefonos}
                    </p>
                  )}

                  {telefonos.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">No tiene teléfonos registrados.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm text-gray-800">
                      {telefonos.map((telefono) => {
                        const clave = `${telefono.numero}-${telefono.tipoId}`;
                        return (
                          <li key={clave} className="flex items-center justify-between gap-2">
                            <span>
                              {telefono.numero}{' '}
                              <span className="text-gray-500">({telefono.tipo})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => manejarEliminarTelefono(telefono)}
                              disabled={eliminandoTelefonoClave === clave}
                              className="text-xs font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {eliminandoTelefonoClave === clave ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <form onSubmit={manejarAgregarTelefono} className="mt-3 flex flex-wrap items-start gap-2">
                    <input
                      type="text"
                      value={nuevoNumero}
                      onChange={(evento) => setNuevoNumero(evento.target.value)}
                      placeholder="Número de teléfono"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                    />
                    <select
                      value={nuevoTipoId}
                      onChange={(evento) => setNuevoTipoId(evento.target.value)}
                      disabled={cargandoTiposTelefono}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                    >
                      <option value="">Selecciona un tipo...</option>
                      {tiposTelefono.map((tipo) => (
                        <option key={tipo.PhoneNumberTypeID} value={tipo.PhoneNumberTypeID}>
                          {tipo.Name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={agregandoTelefono}
                      className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {agregandoTelefono ? 'Agregando...' : 'Agregar'}
                    </button>
                    {errorAgregarTelefono && (
                      <p className="w-full text-sm text-red-600" role="alert">
                        {errorAgregarTelefono}
                      </p>
                    )}
                  </form>
                </>
              )}
            </section>

            {/* 4. Direcciones */}
            <section className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Direcciones
              </h3>

              {cargandoDirecciones ? (
                <p className="mt-2 text-sm text-gray-500">Cargando direcciones...</p>
              ) : (
                <>
                  {errorDirecciones && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errorDirecciones}
                    </p>
                  )}

                  {direcciones.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">No tiene direcciones registradas.</p>
                  ) : (
                    <ul className="mt-2 space-y-3 text-sm">
                      {direcciones.map((direccion) => (
                        <li
                          key={direccion.addressId}
                          className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-800">{direccion.tipoDireccion}</p>
                            <button
                              type="button"
                              onClick={() => manejarEliminarDireccion(direccion)}
                              disabled={eliminandoDireccionId === direccion.addressId}
                              className="text-xs font-medium text-red-600 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {eliminandoDireccionId === direccion.addressId ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          </div>
                          <p className="text-gray-600">
                            {direccion.linea1}
                            {direccion.linea2 ? `, ${direccion.linea2}` : ''}
                          </p>
                          <p className="text-gray-600">
                            {direccion.ciudad}, {direccion.estadoProvincia}, {direccion.pais}
                          </p>
                          <p className="text-gray-600">{direccion.codigoPostal}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form onSubmit={manejarAgregarDireccion} className="mt-4 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={nuevaDireccion.addressLine1}
                        onChange={(evento) => actualizarCampoDireccion('addressLine1', evento.target.value)}
                        placeholder="Dirección (línea 1)"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={nuevaDireccion.addressLine2}
                        onChange={(evento) => actualizarCampoDireccion('addressLine2', evento.target.value)}
                        placeholder="Dirección (línea 2, opcional)"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={nuevaDireccion.city}
                        onChange={(evento) => actualizarCampoDireccion('city', evento.target.value)}
                        placeholder="Ciudad"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      />
                      <select
                        value={nuevaDireccion.stateProvinceId}
                        onChange={(evento) => actualizarCampoDireccion('stateProvinceId', evento.target.value)}
                        disabled={cargandoEstados}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">Selecciona un estado/provincia...</option>
                        {estados.map((estado) => (
                          <option key={estado.StateProvinceID} value={estado.StateProvinceID}>
                            {estado.Name} ({estado.CountryRegionCode})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={nuevaDireccion.postalCode}
                        onChange={(evento) => actualizarCampoDireccion('postalCode', evento.target.value)}
                        placeholder="Código postal"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={nuevaDireccion.addressTypeId}
                        onChange={(evento) => actualizarCampoDireccion('addressTypeId', evento.target.value)}
                        disabled={cargandoTiposDireccion}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">Selecciona un tipo...</option>
                        {tiposDireccion.map((tipo) => (
                          <option key={tipo.AddressTypeID} value={tipo.AddressTypeID}>
                            {tipo.Name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={agregandoDireccion}
                        className="rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {agregandoDireccion ? 'Agregando...' : 'Agregar dirección'}
                      </button>
                    </div>

                    {errorAgregarDireccion && (
                      <p className="text-sm text-red-600" role="alert">
                        {errorAgregarDireccion}
                      </p>
                    )}
                  </form>
                </>
              )}
            </section>
          </div>
        )}
    </div>
  );
}

export default DetallePersona;
