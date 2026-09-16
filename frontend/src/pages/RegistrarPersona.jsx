// Página de registro de una persona nueva (ruta "/personas/nueva").
// El identificador no se pide acá: lo genera el backend (identity de
// Person.BusinessEntity) y se conoce recién en la respuesta 201.
// El formulario en sí (campos, validaciones, estado) vive en
// FormularioPersona, compartido con EditarPersona.

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { crearPersona } from '../api/personas.api';
import Encabezado from '../components/Encabezado';
import FormularioPersona from '../components/FormularioPersona';

const VALORES_INICIALES = {
  personType: '',
  title: '',
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  emailPromotion: 0
};

function RegistrarPersona() {
  const navigate = useNavigate();

  async function alGuardar(datosPersona) {
    const personaCreada = await crearPersona(datosPersona);
    navigate(`/personas/${personaCreada.BusinessEntityID}`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Encabezado />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-base font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver al listado
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Registrar persona</h1>
            <p className="mt-1 text-base text-slate-500">
              Completa los datos para agregar un nuevo contacto al directorio.
            </p>
          </div>
        </div>

        <FormularioPersona
          valoresIniciales={VALORES_INICIALES}
          alGuardar={alGuardar}
          alCancelar={() => navigate('/')}
        />
      </main>
    </div>
  );
}

export default RegistrarPersona;