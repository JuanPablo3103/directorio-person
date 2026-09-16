// Página de registro de una persona nueva (ruta "/personas/nueva").
// El identificador no se pide acá: lo genera el backend (identity de
// Person.BusinessEntity) y se conoce recién en la respuesta 201.
// El formulario en sí (campos, validaciones, estado) vive en
// FormularioPersona, compartido con EditarPersona.

import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-100">
      <Encabezado />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-gray-800">Registrar persona</h1>

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
