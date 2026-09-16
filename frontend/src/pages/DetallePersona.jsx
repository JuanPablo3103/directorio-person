// Página de detalle de una persona (ruta "/personas/:id").

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  IdCard,
  BellRing,
  UserX
} from 'lucide-react';
import { obtenerPersonaPorId, eliminarPersona } from '../api/personas.api';
import Encabezado from '../components/Encabezado';
import Avatar from '../components/Avatar';
import Insignia from '../components/Insignia';
import SeccionDetalle from '../components/SeccionDetalle';

function EsqueletoDetalle() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 animate-pulse-soft rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse-soft rounded bg-slate-200" />
            <div className="h-5 w-28 animate-pulse-soft rounded bg-slate-200" />
          </div>
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse-soft rounded-2xl border border-slate-100 bg-white shadow-sm" />
      ))}
    </div>
  );
}

function DetallePersona() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [error, setError] = useState('');

  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

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
    <div className="min-h-screen bg-slate-50">
      <Encabezado />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-base font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al listado
        </Link>

        {errorEliminar && (
          <p className="mb-5 rounded-xl bg-rose-50 px-5 py-4 text-base font-medium text-rose-700" role="alert">
            {errorEliminar}
          </p>
        )}

        {cargando && <EsqueletoDetalle />}

        {!cargando && noEncontrada && (
          <div className="rounded-2xl border border-slate-100 bg-white p-14 text-center shadow-sm">
            <UserX className="mx-auto h-14 w-14 text-slate-300" />
            <p className="mt-4 text-xl font-semibold text-slate-800">Persona no encontrada</p>
            <p className="mt-2 text-base text-slate-500">
              No existe ninguna persona con el identificador {id}.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700"
            >
              Volver al listado
            </Link>
          </div>
        )}

        {!cargando && !noEncontrada && error && (
          <div className="rounded-2xl border border-slate-100 bg-white p-14 text-center text-base text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!cargando && !noEncontrada && !error && persona && (
          <div className="space-y-6">
            {/* Encabezado de perfil */}
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500" />
              <div className="px-8 pb-8">
                <div className="-mt-12 flex flex-wrap items-end justify-between gap-5">
                  <div className="flex items-end gap-5">
                    <div className="rounded-full bg-white p-1.5 shadow-md">
                      <Avatar nombre={persona.nombreCompleto} tamano="lg" />
                    </div>
                    <div className="pb-1">
                      <h2 className="text-2xl font-bold text-slate-800">{persona.nombreCompleto}</h2>
                      <div className="mt-2 flex items-center gap-2">
                        <Insignia tipo={persona.PersonType} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/personas/${id}/editar`}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700"
                    >
                      <Pencil className="h-5 w-5" />
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={manejarEliminar}
                      disabled={eliminando}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-5 py-3 text-base font-semibold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-5 w-5" />
                      {eliminando ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-base">
                    <IdCard className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500">Identificador:</span>
                    <span className="font-medium text-slate-800">{persona.BusinessEntityID}</span>
                  </div>
                  <div className="flex items-center gap-3 text-base">
                    <BellRing className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500">Promociones por correo:</span>
                    <span
                      className={`font-medium ${persona.EmailPromotion > 0 ? 'text-emerald-600' : 'text-slate-500'}`}
                    >
                      {persona.EmailPromotion > 0 ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <SeccionDetalle
              icono={Mail}
              titulo="Correos electrónicos"
              cantidad={persona.correos.length}
              mensajeVacio="No tiene correos registrados."
            >
              <ul className="space-y-2.5">
                {persona.correos.map((correo) => (
                  <li
                    key={correo.EmailAddressID}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-base text-slate-700"
                  >
                    <Mail className="h-5 w-5 text-slate-400" />
                    {correo.EmailAddress}
                  </li>
                ))}
              </ul>
            </SeccionDetalle>

            <SeccionDetalle
              icono={Phone}
              titulo="Teléfonos"
              cantidad={persona.telefonos.length}
              mensajeVacio="No tiene teléfonos registrados."
            >
              <ul className="space-y-2.5">
                {persona.telefonos.map((telefono) => (
                  <li
                    key={`${telefono.PhoneNumber}-${telefono.PhoneNumberTypeID}`}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-base text-slate-700"
                  >
                    <Phone className="h-5 w-5 text-slate-400" />
                    {telefono.PhoneNumber}
                    <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-sm font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                      {telefono.tipoTelefono}
                    </span>
                  </li>
                ))}
              </ul>
            </SeccionDetalle>

            <SeccionDetalle
              icono={MapPin}
              titulo="Direcciones"
              cantidad={persona.direcciones.length}
              mensajeVacio="No tiene direcciones registradas."
            >
              <ul className="space-y-4">
                {persona.direcciones.map((direccion) => (
                  <li key={direccion.AddressID} className="rounded-xl bg-slate-50 p-5">
                    <div className="mb-2 flex items-center gap-2.5">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <span className="text-base font-semibold text-slate-800">{direccion.tipoDireccion}</span>
                    </div>
                    <p className="pl-7 text-base text-slate-600">
                      {direccion.AddressLine1}
                      {direccion.AddressLine2 ? `, ${direccion.AddressLine2}` : ''}
                    </p>
                    <p className="pl-7 text-base text-slate-600">
                      {direccion.City}, {direccion.estadoProvincia}, {direccion.pais}
                    </p>
                    <p className="pl-7 text-base text-slate-600">{direccion.PostalCode}</p>
                  </li>
                ))}
              </ul>
            </SeccionDetalle>
          </div>
        )}
      </main>
    </div>
  );
}

export default DetallePersona;