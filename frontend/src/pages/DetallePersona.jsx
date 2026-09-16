// Página de detalle de una persona (ruta "/personas/:id"): datos
// básicos, correos, teléfonos y direcciones.

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerPersonaPorId, eliminarPersona } from '../api/personas.api';
import clienteApi from '../api/client';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import Esqueleto from '../components/Esqueleto';

function DetallePersona() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirmar = useConfirm();
  const notificar = useToast();

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
      notificar('Correo agregado.');
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
    const confirmado = await confirmar({
      titulo: '¿Eliminar este correo?',
      descripcion: correo.correo,
      textoConfirmar: 'Eliminar',
      destructivo: true
    });

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
      notificar('Correo eliminado.');
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
      notificar('Teléfono agregado.');
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
    const confirmado = await confirmar({
      titulo: '¿Eliminar este teléfono?',
      descripcion: `${telefono.numero} (${telefono.tipo})`,
      textoConfirmar: 'Eliminar',
      destructivo: true
    });

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

      notificar('Teléfono eliminado.');
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
      notificar('Dirección agregada.');
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
    const confirmado = await confirmar({
      titulo: '¿Eliminar esta dirección?',
      descripcion: `${direccion.tipoDireccion}: ${direccion.linea1}`,
      textoConfirmar: 'Eliminar',
      destructivo: true
    });

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
      notificar('Dirección eliminada.');
    } catch {
      setErrorDirecciones('No se pudo eliminar la dirección. Intenta nuevamente.');
    } finally {
      setEliminandoDireccionId(null);
    }
  }

  async function manejarEliminar() {
    const confirmado = await confirmar({
      titulo: `¿Eliminar a ${persona.nombreCompleto}?`,
      descripcion: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      destructivo: true
    });

    if (!confirmado) {
      return;
    }

    setErrorEliminar('');
    setEliminando(true);

    try {
      await eliminarPersona(id);
      notificar(`${persona.nombreCompleto} fue eliminado.`);
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

  // Clases repetidas de los campos de formulario de las tres secciones
  // (correos, teléfonos, direcciones): mismos tokens que Login y Listado.
  const claseCampo =
    'rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-1.5 text-sm text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-acento disabled:opacity-60';
  const claseBotonSecundario =
    'rounded-[var(--radius-control)] border border-borde px-3 py-1.5 text-sm font-medium text-texto outline-none hover:bg-hoja focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-60';
  const claseEliminarChico =
    'text-xs font-medium text-destructivo outline-none hover:opacity-70 focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Siempre visible, independientemente del estado de la carga */}
        <Link
          to="/personas"
          className="rounded-[var(--radius-control)] text-sm text-texto-secundario outline-none hover:text-texto focus-visible:ring-2 focus-visible:ring-acento"
        >
          ← Volver al listado
        </Link>

        {!cargando && !noEncontrada && !error && persona && (
          <div className="flex gap-2">
            <Link to={`/personas/${id}/editar`} className={claseBotonSecundario}>
              Editar
            </Link>
            <button
              type="button"
              onClick={manejarEliminar}
              disabled={eliminando}
              className="rounded-[var(--radius-control)] border border-destructivo px-3 py-1.5 text-sm font-medium text-destructivo outline-none hover:bg-destructivo hover:text-papel focus-visible:ring-2 focus-visible:ring-acento disabled:cursor-not-allowed disabled:opacity-60"
            >
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>

      {errorEliminar && (
        <p className="mt-4 border-l-2 border-destructivo py-1 pl-3 text-sm text-destructivo" role="alert">
          {errorEliminar}
        </p>
      )}

      {cargando && (
        <div className="mt-6" aria-hidden="true">
          <Esqueleto className="h-8 w-64" />
          <div className="mt-4 flex gap-8">
            <Esqueleto className="h-9 w-20" />
            <Esqueleto className="h-9 w-20" />
            <Esqueleto className="h-9 w-32" />
          </div>
          <div className="mt-8 space-y-3 border-t border-borde pt-6">
            <Esqueleto className="h-4 w-40" />
            <Esqueleto className="h-4 w-full max-w-md" />
            <Esqueleto className="h-4 w-full max-w-sm" />
          </div>
        </div>
      )}

      {!cargando && noEncontrada && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-texto">Persona no encontrada</p>
          <p className="mt-1 text-sm text-texto-secundario">
            No existe ninguna persona con el identificador {id}.
          </p>
          <Link
            to="/personas"
            className="mt-4 inline-block rounded-[var(--radius-control)] bg-acento px-4 py-2 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie"
          >
            Volver al listado
          </Link>
        </div>
      )}

      {!cargando && !noEncontrada && error && (
        <p className="py-16 text-center text-sm text-destructivo">{error}</p>
      )}

      {!cargando && !noEncontrada && !error && persona && (
        <div className="mt-6">
          {/* 1. Datos de la persona: la única jerarquía tipográfica fuerte
              de esta pantalla es el nombre. Todo lo demás son hechos
              secundarios, mostrados como pares etiqueta/valor separados
              (no una cadena unida con puntos medios). */}
          <section>
            <h2 className="font-display text-[28px] leading-tight font-semibold text-texto">
              {persona.nombreCompleto}
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-texto-secundario">Tipo</p>
                <p className="text-sm text-texto">
                  {ETIQUETAS_TIPO[persona.PersonType] ?? persona.PersonType}
                </p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Identificador</p>
                <p className="font-mono text-sm tabular-nums text-texto">
                  {persona.BusinessEntityID}
                </p>
              </div>
              <div>
                <p className="text-xs text-texto-secundario">Promociones por correo</p>
                <p className="text-sm text-texto">{persona.EmailPromotion > 0 ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </section>

          {/* 2. Correos electrónicos */}
          <section className="mt-8 border-t border-borde pt-6">
            <h3 className="text-[15px] font-semibold text-texto">Correos electrónicos</h3>

            {cargandoCorreos ? (
              <div className="mt-3 space-y-2" aria-hidden="true">
                <Esqueleto className="h-5 w-48" />
                <Esqueleto className="h-9 w-full max-w-md" />
              </div>
            ) : (
              <>
                {errorCorreos && (
                  <p className="mt-3 text-sm text-destructivo" role="alert">
                    {errorCorreos}
                  </p>
                )}

                {correos.length === 0 ? (
                  <p className="mt-3 text-sm text-texto-secundario">
                    Todavía no tiene correos. Agregá el primero abajo.
                  </p>
                ) : (
                  <ul className="mt-3">
                    {correos.map((correo) => (
                      <li
                        key={correo.emailAddressId}
                        className="flex items-center justify-between gap-2 border-b border-borde py-2 text-sm last:border-0"
                      >
                        <span className="text-texto">{correo.correo}</span>
                        <button
                          type="button"
                          onClick={() => manejarEliminarCorreo(correo)}
                          disabled={eliminandoCorreoId === correo.emailAddressId}
                          className={claseEliminarChico}
                        >
                          {eliminandoCorreoId === correo.emailAddressId ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={manejarAgregarCorreo} className="mt-4 flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={nuevoCorreo}
                      onChange={(evento) => setNuevoCorreo(evento.target.value)}
                      placeholder="nuevo.correo@ejemplo.com"
                      className={`w-full ${claseCampo}`}
                    />
                    {errorAgregarCorreo && (
                      <p className="mt-1 text-sm text-destructivo" role="alert">
                        {errorAgregarCorreo}
                      </p>
                    )}
                  </div>
                  <button type="submit" disabled={agregandoCorreo} className={claseBotonSecundario}>
                    {agregandoCorreo ? 'Agregando...' : 'Agregar'}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* 3. Teléfonos */}
          <section className="mt-8 border-t border-borde pt-6">
            <h3 className="text-[15px] font-semibold text-texto">Teléfonos</h3>

            {cargandoTelefonos ? (
              <div className="mt-3 space-y-2" aria-hidden="true">
                <Esqueleto className="h-5 w-40" />
                <Esqueleto className="h-9 w-full max-w-md" />
              </div>
            ) : (
              <>
                {errorTelefonos && (
                  <p className="mt-3 text-sm text-destructivo" role="alert">
                    {errorTelefonos}
                  </p>
                )}

                {telefonos.length === 0 ? (
                  <p className="mt-3 text-sm text-texto-secundario">
                    Todavía no tiene teléfonos. Agregá el primero abajo.
                  </p>
                ) : (
                  <ul className="mt-3">
                    {telefonos.map((telefono) => {
                      const clave = `${telefono.numero}-${telefono.tipoId}`;
                      return (
                        <li
                          key={clave}
                          className="flex items-center justify-between gap-2 border-b border-borde py-2 text-sm last:border-0"
                        >
                          <span className="text-texto">
                            {telefono.numero}{' '}
                            <span className="text-texto-secundario">({telefono.tipo})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => manejarEliminarTelefono(telefono)}
                            disabled={eliminandoTelefonoClave === clave}
                            className={claseEliminarChico}
                          >
                            {eliminandoTelefonoClave === clave ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <form onSubmit={manejarAgregarTelefono} className="mt-4 flex flex-wrap items-start gap-2">
                  <input
                    type="text"
                    value={nuevoNumero}
                    onChange={(evento) => setNuevoNumero(evento.target.value)}
                    placeholder="Número de teléfono"
                    className={`flex-1 ${claseCampo}`}
                  />
                  <select
                    value={nuevoTipoId}
                    onChange={(evento) => setNuevoTipoId(evento.target.value)}
                    disabled={cargandoTiposTelefono}
                    className={claseCampo}
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposTelefono.map((tipo) => (
                      <option key={tipo.PhoneNumberTypeID} value={tipo.PhoneNumberTypeID}>
                        {tipo.Name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" disabled={agregandoTelefono} className={claseBotonSecundario}>
                    {agregandoTelefono ? 'Agregando...' : 'Agregar'}
                  </button>
                  {errorAgregarTelefono && (
                    <p className="w-full text-sm text-destructivo" role="alert">
                      {errorAgregarTelefono}
                    </p>
                  )}
                </form>
              </>
            )}
          </section>

          {/* 4. Direcciones */}
          <section className="mt-8 border-t border-borde pt-6">
            <h3 className="text-[15px] font-semibold text-texto">Direcciones</h3>

            {cargandoDirecciones ? (
              <div className="mt-3 space-y-2" aria-hidden="true">
                <Esqueleto className="h-5 w-56" />
                <Esqueleto className="h-16 w-full max-w-md" />
              </div>
            ) : (
              <>
                {errorDirecciones && (
                  <p className="mt-3 text-sm text-destructivo" role="alert">
                    {errorDirecciones}
                  </p>
                )}

                {direcciones.length === 0 ? (
                  <p className="mt-3 text-sm text-texto-secundario">
                    Todavía no tiene direcciones. Agregá la primera abajo.
                  </p>
                ) : (
                  <ul className="mt-3">
                    {direcciones.map((direccion) => (
                      <li
                        key={direccion.addressId}
                        className="border-b border-borde py-3 text-sm last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-texto">{direccion.tipoDireccion}</p>
                          <button
                            type="button"
                            onClick={() => manejarEliminarDireccion(direccion)}
                            disabled={eliminandoDireccionId === direccion.addressId}
                            className={claseEliminarChico}
                          >
                            {eliminandoDireccionId === direccion.addressId ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                        <p className="mt-1 text-texto-secundario">
                          {direccion.linea1}
                          {direccion.linea2 ? `, ${direccion.linea2}` : ''}
                        </p>
                        <p className="text-texto-secundario">
                          {direccion.ciudad}, {direccion.estadoProvincia}, {direccion.pais}
                        </p>
                        <p className="text-texto-secundario">{direccion.codigoPostal}</p>
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
                      className={claseCampo}
                    />
                    <input
                      type="text"
                      value={nuevaDireccion.addressLine2}
                      onChange={(evento) => actualizarCampoDireccion('addressLine2', evento.target.value)}
                      placeholder="Dirección (línea 2, opcional)"
                      className={claseCampo}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={nuevaDireccion.city}
                      onChange={(evento) => actualizarCampoDireccion('city', evento.target.value)}
                      placeholder="Ciudad"
                      className={claseCampo}
                    />
                    <select
                      value={nuevaDireccion.stateProvinceId}
                      onChange={(evento) => actualizarCampoDireccion('stateProvinceId', evento.target.value)}
                      disabled={cargandoEstados}
                      className={claseCampo}
                    >
                      <option value="">Selecciona un estado/provincia</option>
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
                      className={claseCampo}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={nuevaDireccion.addressTypeId}
                      onChange={(evento) => actualizarCampoDireccion('addressTypeId', evento.target.value)}
                      disabled={cargandoTiposDireccion}
                      className={claseCampo}
                    >
                      <option value="">Selecciona un tipo</option>
                      {tiposDireccion.map((tipo) => (
                        <option key={tipo.AddressTypeID} value={tipo.AddressTypeID}>
                          {tipo.Name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" disabled={agregandoDireccion} className={claseBotonSecundario}>
                      {agregandoDireccion ? 'Agregando...' : 'Agregar dirección'}
                    </button>
                  </div>

                  {errorAgregarDireccion && (
                    <p className="text-sm text-destructivo" role="alert">
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
