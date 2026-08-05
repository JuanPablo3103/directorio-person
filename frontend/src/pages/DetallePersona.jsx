// Página de detalle de una persona (ruta "/personas/:id"): datos
// básicos, correos, teléfonos y direcciones.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerPersonaPorId } from '../api/personas.api';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';
import Encabezado from '../components/Encabezado';

function DetallePersona() {
  const { id } = useParams();

  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Encabezado />

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Siempre visible, independientemente del estado de la carga */}
        <Link to="/" className="inline-block text-sm text-gray-600 hover:text-gray-800">
          ← Volver al listado
        </Link>

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
              {persona.correos.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No tiene correos registrados.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-gray-800">
                  {persona.correos.map((correo) => (
                    <li key={correo.EmailAddressID}>{correo.EmailAddress}</li>
                  ))}
                </ul>
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
