// Formulario compartido para crear y editar una persona (HU-05 y HU-06).
// No sabe si está creando o editando: recibe los valores iniciales y una
// función alGuardar que hace la llamada a la API correspondiente y decide
// a dónde navegar. Este componente solo se ocupa del estado del formulario,
// la normalización de datos antes de enviarlos y el reparto de errores del
// backend a cada campo.
//
// Sin tarjeta alrededor: es un formulario de página completa, no un
// diálogo flotante — vive directo sobre la superficie de la página, igual
// que el resto de los controles del sistema.

import { useState } from 'react';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';

// Opciones del selector de tipo, derivadas del mismo diccionario que usan
// el listado y el detalle (sin la entrada "Todos", que no aplica acá).
const OPCIONES_TIPO_PERSONA = Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => ({
  valor,
  etiqueta
}));

const OPCIONES_EMAIL_PROMOTION = [
  { valor: 0, etiqueta: 'Ninguna' },
  { valor: 1, etiqueta: 'Solo AdventureWorks' },
  { valor: 2, etiqueta: 'AdventureWorks y socios' }
];

// Nombres de campo que el backend puede mencionar entre paréntesis dentro
// de cada mensaje de validación (ej. "El nombre (firstName) es
// obligatorio."). Se usan para repartir el mensaje general de un 400 en
// el campo correspondiente.
const CAMPOS_VALIDABLES = [
  'personType',
  'firstName',
  'lastName',
  'title',
  'middleName',
  'suffix',
  'emailPromotion'
];

// El backend junta todos los mensajes de express-validator en un solo
// string separado por espacios (ver personas.controller.js). Cada mensaje
// es una oración completa que termina en punto, así que se puede volver a
// separar por ". " y asociar cada una a su campo buscando "(nombreCampo)".
function repartirErroresPorCampo(mensaje) {
  const erroresPorCampo = {};
  const erroresGenerales = [];

  const oraciones = mensaje.split('. ').map((oracion) => oracion.trim()).filter(Boolean);

  for (const oracion of oraciones) {
    const campoEncontrado = CAMPOS_VALIDABLES.find((campo) => oracion.includes(`(${campo})`));

    if (campoEncontrado) {
      erroresPorCampo[campoEncontrado] = oracion.endsWith('.') ? oracion : `${oracion}.`;
    } else {
      erroresGenerales.push(oracion);
    }
  }

  return { erroresPorCampo, erroresGenerales };
}

// Mismos tokens que ya usan Login, Listado y Detalle para inputs/selects.
const claseCampo =
  'mt-1 w-full rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-2 text-sm text-texto outline-none focus-visible:ring-2 focus-visible:ring-acento';

// valoresIniciales: { personType, title, firstName, middleName, lastName,
// suffix, emailPromotion } - todos como string excepto emailPromotion
// (number), listos para usarse directo como value de cada input.
// alGuardar: async (datosNormalizados) => void. Si falla, debe rechazar la
// promesa (dejar que el error de axios suba) para que este componente lo
// clasifique; si tiene éxito, es responsable de navegar a donde corresponda.
// alCancelar: () => void, se llama al hacer clic en "Cancelar".
function FormularioPersona({
  valoresIniciales,
  alGuardar,
  alCancelar,
  textoGuardar = 'Guardar',
  textoGuardando = 'Guardando...'
}) {
  const [valores, setValores] = useState(valoresIniciales);
  const [erroresPorCampo, setErroresPorCampo] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo(campo, valor) {
    setValores((valoresActuales) => ({ ...valoresActuales, [campo]: valor }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral('');
    setErroresPorCampo({});
    setGuardando(true);

    try {
      const datosPersona = {
        personType: valores.personType,
        title: valores.title.trim() || undefined,
        firstName: valores.firstName.trim(),
        middleName: valores.middleName.trim() || undefined,
        lastName: valores.lastName.trim(),
        suffix: valores.suffix.trim() || undefined,
        emailPromotion: Number(valores.emailPromotion)
      };

      await alGuardar(datosPersona);
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 400) {
        const mensaje = errorPeticion.response.data?.mensaje ?? '';
        const { erroresPorCampo: porCampo, erroresGenerales } = repartirErroresPorCampo(mensaje);

        setErroresPorCampo(porCampo);
        if (erroresGenerales.length > 0) {
          setErrorGeneral(erroresGenerales.join(' '));
        }
      } else if (errorPeticion.response?.status === 404) {
        setErrorGeneral(
          errorPeticion.response.data?.mensaje ?? 'La persona ya no existe.'
        );
      } else if (!errorPeticion.response) {
        setErrorGeneral('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setErrorGeneral('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="space-y-5">
      {errorGeneral && (
        <p className="border-l-2 border-destructivo py-1 pl-3 text-sm text-destructivo" role="alert">
          {errorGeneral}
        </p>
      )}

      <div>
        <label htmlFor="personType" className="block text-sm text-texto-secundario">
          Tipo de persona *
        </label>
        <select
          id="personType"
          value={valores.personType}
          onChange={(evento) => actualizarCampo('personType', evento.target.value)}
          className={claseCampo}
        >
          <option value="">Selecciona un tipo</option>
          {OPCIONES_TIPO_PERSONA.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        {erroresPorCampo.personType && (
          <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.personType}</p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm text-texto-secundario">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={valores.title}
          onChange={(evento) => actualizarCampo('title', evento.target.value)}
          className={claseCampo}
        />
        {erroresPorCampo.title && (
          <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.title}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm text-texto-secundario">
            Nombre *
          </label>
          <input
            id="firstName"
            type="text"
            maxLength={50}
            value={valores.firstName}
            onChange={(evento) => actualizarCampo('firstName', evento.target.value)}
            className={claseCampo}
          />
          {erroresPorCampo.firstName && (
            <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="middleName" className="block text-sm text-texto-secundario">
            Segundo nombre
          </label>
          <input
            id="middleName"
            type="text"
            maxLength={50}
            value={valores.middleName}
            onChange={(evento) => actualizarCampo('middleName', evento.target.value)}
            className={claseCampo}
          />
          {erroresPorCampo.middleName && (
            <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.middleName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lastName" className="block text-sm text-texto-secundario">
            Apellido *
          </label>
          <input
            id="lastName"
            type="text"
            maxLength={50}
            value={valores.lastName}
            onChange={(evento) => actualizarCampo('lastName', evento.target.value)}
            className={claseCampo}
          />
          {erroresPorCampo.lastName && (
            <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.lastName}</p>
          )}
        </div>

        <div>
          <label htmlFor="suffix" className="block text-sm text-texto-secundario">
            Sufijo
          </label>
          <input
            id="suffix"
            type="text"
            value={valores.suffix}
            onChange={(evento) => actualizarCampo('suffix', evento.target.value)}
            className={claseCampo}
          />
          {erroresPorCampo.suffix && (
            <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.suffix}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="emailPromotion" className="block text-sm text-texto-secundario">
          Preferencia de promociones
        </label>
        <select
          id="emailPromotion"
          value={valores.emailPromotion}
          onChange={(evento) => actualizarCampo('emailPromotion', evento.target.value)}
          className={claseCampo}
        >
          {OPCIONES_EMAIL_PROMOTION.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
        {erroresPorCampo.emailPromotion && (
          <p className="mt-1 text-sm text-destructivo">{erroresPorCampo.emailPromotion}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={alCancelar}
          className="rounded-[var(--radius-control)] border border-borde px-4 py-2 text-sm font-medium text-texto outline-none hover:bg-hoja focus-visible:ring-2 focus-visible:ring-acento"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-[var(--radius-control)] bg-acento px-4 py-2 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? textoGuardando : textoGuardar}
        </button>
      </div>
    </form>
  );
}

export default FormularioPersona;
