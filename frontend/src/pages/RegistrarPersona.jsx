// Página de registro de una persona nueva (ruta "/personas/nueva").
// El identificador no se pide acá: lo genera el backend (identity de
// Person.BusinessEntity) y se conoce recién en la respuesta 201.
// El formulario en sí (campos, validaciones, estado) vive en
// FormularioPersona, compartido con EditarPersona.
//
// Sin <h1> propio: la barra de contexto ya muestra "Registrar persona"
// para esta ruta (ver tituloDesdeRuta en BarraContexto.jsx). Repetirlo
// sería la misma redundancia que ya corregimos en el login y en Inicio.

import { useNavigate } from 'react-router-dom';
import { crearPersona } from '../api/personas.api';
import FormularioPersona from '../components/FormularioPersona';
import { useToast } from '../context/ToastContext';

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
  const notificar = useToast();

  async function alGuardar(datosPersona) {
    const personaCreada = await crearPersona(datosPersona);
    notificar(`${personaCreada.FirstName} ${personaCreada.LastName} fue registrado.`);
    navigate(`/personas/${personaCreada.BusinessEntityID}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <FormularioPersona
        valoresIniciales={VALORES_INICIALES}
        alGuardar={alGuardar}
        alCancelar={() => navigate('/personas')}
      />
    </div>
  );
}

export default RegistrarPersona;
