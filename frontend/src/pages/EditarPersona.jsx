// Página de edición de una persona existente (ruta "/personas/:id/editar").
// Carga los datos actuales, se los pasa como valores iniciales a
// FormularioPersona (compartido con RegistrarPersona) y al guardar llama
// al PUT correspondiente.
//
// Sin <h1> propio: la barra de contexto ya muestra "Editar persona" para
// esta ruta (ver tituloDesdeRuta en BarraContexto.jsx).

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerPersonaPorId, actualizarPersona } from '../api/personas.api';
import FormularioPersona from '../components/FormularioPersona';
import { useToast } from '../context/ToastContext';
import Esqueleto from '../components/Esqueleto';

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
  const notificar = useToast();

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
    notificar('Los cambios se guardaron.');
    navigate(`/personas/${id}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {cargando && (
        <div className="space-y-5" aria-hidden="true">
          <Esqueleto className="h-9 w-full" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Esqueleto className="h-9 w-full" />
            <Esqueleto className="h-9 w-full" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Esqueleto className="h-9 w-full" />
            <Esqueleto className="h-9 w-full" />
          </div>
          <Esqueleto className="h-9 w-full" />
        </div>
      )}

      {!cargando && noEncontrada && (
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-texto">Persona no encontrada</p>
          <p className="mt-1 text-sm text-texto-secundario">
            No existe ninguna persona con el identificador {id}.
          </p>
        </div>
      )}

      {!cargando && !noEncontrada && error && (
        <p className="py-16 text-center text-sm text-destructivo">{error}</p>
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
