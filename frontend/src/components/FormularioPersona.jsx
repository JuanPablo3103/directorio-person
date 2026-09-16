// Formulario compartido para crear y editar una persona (HU-05 y HU-06).

import { useState } from 'react';
import { UserCog, Contact2, Mail, Save, X } from 'lucide-react';
import { ETIQUETAS_TIPO } from '../constants/tiposPersona';

const OPCIONES_TIPO_PERSONA = Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => ({
  valor,
  etiqueta
}));

const OPCIONES_EMAIL_PROMOTION = [
  { valor: 0, etiqueta: 'Ninguna' },
  { valor: 1, etiqueta: 'Solo AdventureWorks' },
  { valor: 2, etiqueta: 'AdventureWorks y socios' }
];

const CAMPOS_VALIDABLES = [
  'personType',
  'firstName',
  'lastName',
  'title',
  'middleName',
  'suffix',
  'emailPromotion'
];

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

const CLASES_CAMPO =
  'mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-800 shadow-sm transition-shadow focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10';

function Campo({ id, etiqueta, requerido, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-medium text-slate-700">
        {etiqueta} {requerido && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

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
    <form onSubmit={manejarEnvio} noValidate className="space-y-7">
      {errorGeneral && (
        <p className="rounded-xl bg-rose-50 px-5 py-4 text-base font-medium text-rose-700" role="alert">
          {errorGeneral}
        </p>
      )}

      {/* Clasificación */}
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <UserCog className="h-5.5 w-5.5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Clasificación</h3>
        </div>

        <Campo id="personType" etiqueta="Tipo de persona" requerido error={erroresPorCampo.personType}>
          <select
            id="personType"
            value={valores.personType}
            onChange={(evento) => actualizarCampo('personType', evento.target.value)}
            className={CLASES_CAMPO}
          >
            <option value="">Selecciona un tipo...</option>
            {OPCIONES_TIPO_PERSONA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {/* Datos personales */}
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Contact2 className="h-5.5 w-5.5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Datos personales</h3>
        </div>

        <div className="space-y-5">
          <Campo id="title" etiqueta="Título" error={erroresPorCampo.title}>
            <input
              id="title"
              type="text"
              value={valores.title}
              onChange={(evento) => actualizarCampo('title', evento.target.value)}
              className={CLASES_CAMPO}
            />
          </Campo>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="firstName" etiqueta="Nombre" requerido error={erroresPorCampo.firstName}>
              <input
                id="firstName"
                type="text"
                maxLength={50}
                value={valores.firstName}
                onChange={(evento) => actualizarCampo('firstName', evento.target.value)}
                className={CLASES_CAMPO}
              />
            </Campo>

            <Campo id="middleName" etiqueta="Segundo nombre" error={erroresPorCampo.middleName}>
              <input
                id="middleName"
                type="text"
                maxLength={50}
                value={valores.middleName}
                onChange={(evento) => actualizarCampo('middleName', evento.target.value)}
                className={CLASES_CAMPO}
              />
            </Campo>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Campo id="lastName" etiqueta="Apellido" requerido error={erroresPorCampo.lastName}>
              <input
                id="lastName"
                type="text"
                maxLength={50}
                value={valores.lastName}
                onChange={(evento) => actualizarCampo('lastName', evento.target.value)}
                className={CLASES_CAMPO}
              />
            </Campo>

            <Campo id="suffix" etiqueta="Sufijo" error={erroresPorCampo.suffix}>
              <input
                id="suffix"
                type="text"
                value={valores.suffix}
                onChange={(evento) => actualizarCampo('suffix', evento.target.value)}
                className={CLASES_CAMPO}
              />
            </Campo>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Mail className="h-5.5 w-5.5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Preferencias</h3>
        </div>

        <Campo id="emailPromotion" etiqueta="Preferencia de promociones" error={erroresPorCampo.emailPromotion}>
          <select
            id="emailPromotion"
            value={valores.emailPromotion}
            onChange={(evento) => actualizarCampo('emailPromotion', evento.target.value)}
            className={CLASES_CAMPO}
          >
            {OPCIONES_EMAIL_PROMOTION.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={alCancelar}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X className="h-5 w-5" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {guardando ? textoGuardando : textoGuardar}
        </button>
      </div>
    </form>
  );
}

export default FormularioPersona;