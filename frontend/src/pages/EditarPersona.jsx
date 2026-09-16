// Página de edición de una persona existente (ruta "/personas/:id/editar").
// Carga los datos actuales, se los pasa como valores iniciales a
// FormularioPersona (compartido con RegistrarPersona) y al guardar llama
// al PUT correspondiente.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerPersonaPorId, actualizarPersona } from '../api/personas.api';
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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-800">Editar persona</h1>

      {cargando && (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-md">
          Cargando...
        </div>
      )}

      {!cargando && noEncontrada && (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <p className="text-lg font-medium text-gray-800">Persona no encontrada</p>
          <p className="mt-1 text-sm text-gray-500">
            No existe ninguna persona con el identificador {id}.
          </p>
        </div>
      )}

      {!cargando && !noEncontrada && error && (
        <div className="rounded-lg bg-white p-8 text-center text-red-600 shadow-md">
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
    </div>
  );
}

export default EditarPersona;
