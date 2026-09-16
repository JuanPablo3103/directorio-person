// Página de edición de una persona existente (ruta "/personas/:id/editar").
// Carga los datos actuales, se los pasa como valores iniciales a
// FormularioPersona (compartido con RegistrarPersona) y al guardar llama
// al PUT correspondiente.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserX, UserCog } from 'lucide-react';
import { obtenerPersonaPorId, actualizarPersona } from '../api/personas.api';
import Encabezado from '../components/Encabezado';
import FormularioPersona from '../components/FormularioPersona';

// Convierte los datos que devuelve el backend (con null en los campos
// opcionales vacíos) al formato que espera FormularioPersona (string vacío,
// para que los inputs controlados no reciban null como value).
function aValoresIniciales(persona) {
  return {
    personType: persona.PersonType ?? '',
    title: persona.Title ?? '',
    firstName: persona.FirstName ?? '',
    middleName: persona.MiddleName ?? '',
    lastName: persona.LastName ?? '',
    suffix: persona.Suffix ?? '',
    emailPromotion: persona.EmailPromotion ?? 0
  };
}

function EditarPersona() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [valoresIniciales, setValoresIniciales] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function cargarPersona() {
      setCargando(true);
      setNoEncontrada(false);
      setError('');

      try {
        const persona = await obtenerPersonaPorId(id);
        if (!cancelado) {
          setValoresIniciales(aValoresIniciales(persona));
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

  async function alGuardar(datosPersona) {
    await actualizarPersona(id, datosPersona);
    navigate(`/personas/${id}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Encabezado />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(`/personas/${id}`)}
          className="mb-6 inline-flex items-center gap-2 text-base font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al detalle
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Editar persona</h1>
            <p className="mt-1 text-base text-slate-500">
              Actualiza los datos del contacto y guarda los cambios.
            </p>
          </div>
        </div>

        {cargando && (
          <div className="rounded-2xl border border-slate-100 bg-white p-14 text-center text-base text-slate-500 shadow-sm">
            Cargando...
          </div>
        )}

        {!cargando && noEncontrada && (
          <div className="rounded-2xl border border-slate-100 bg-white p-14 text-center shadow-sm">
            <UserX className="mx-auto h-14 w-14 text-slate-300" />
            <p className="mt-4 text-xl font-semibold text-slate-800">Persona no encontrada</p>
            <p className="mt-2 text-base text-slate-500">
              No existe ninguna persona con el identificador {id}.
            </p>
          </div>
        )}

        {!cargando && !noEncontrada && error && (
          <div className="rounded-2xl border border-slate-100 bg-white p-14 text-center text-base text-rose-600 shadow-sm">
            {error}
          </div>
        )}

        {!cargando && !noEncontrada && !error && valoresIniciales && (
          <FormularioPersona
            valoresIniciales={valoresIniciales}
            alGuardar={alGuardar}
            alCancelar={() => navigate(`/personas/${id}`)}
            textoGuardar="Actualizar"
            textoGuardando="Actualizando..."
          />
        )}
      </main>
    </div>
  );
}

export default EditarPersona;