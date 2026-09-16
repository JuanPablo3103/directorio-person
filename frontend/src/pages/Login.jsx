// Página de inicio de sesión.
//
// Es la única pantalla de toda la app que no vive dentro del Shell (no
// tiene riel ni barra de contexto: todavía no hay sesión). Por eso, y
// porque es la puerta de entrada, es donde concentramos el único gesto
// de marca fuerte del sistema: un panel oscuro fijo con el logotipo a
// tamaño real, que no se invierte con el tema (ver comentario en el
// panel). El resto de la pantalla es tan sobrio como cualquier otra.

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

function Login() {
  const { estaAutenticado, iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Si ya hay sesión activa, no tiene sentido mostrar el formulario:
  // se manda directo al listado.
  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');

    if (!nombreUsuario.trim() || !contrasena.trim()) {
      setError('Ingresá tu usuario y tu contraseña para continuar.');
      return;
    }

    setEnviando(true);

    try {
      await iniciarSesion(nombreUsuario.trim(), contrasena);
      navigate('/', { replace: true });
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 401) {
        setError('Usuario o contraseña incorrectos. Revisá ambos campos e intentá de nuevo.');
      } else if (!errorPeticion.response) {
        // No llegó respuesta del servidor: caído, sin red, CORS, etc.
        setError('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Panel de marca: bg-tinta fijo, no bg-superficie. Es una placa de
          identidad, no una superficie de interfaz, así que no se invierte
          con el tema — igual criterio que el filete ámbar del riel. En
          mobile se reduce a una franja compacta arriba del formulario. */}
      <div className="flex shrink-0 flex-col justify-between bg-tinta px-8 py-8 text-papel md:w-[38%] md:px-14 md:py-14">
        <Logo tamano={28} className="text-papel" />

        <div className="hidden md:block">
          <p className="max-w-[26ch] font-display text-4xl leading-[1.05] font-semibold tracking-tight text-papel">
            El directorio de Adventure Works Cycles
          </p>
          <p className="mt-4 max-w-[32ch] text-sm text-niebla">
            Datos de contacto de clientes, empleados, vendedores y
            contactos de tienda, en un solo lugar.
          </p>
        </div>

        <p className="hidden text-xs text-acero md:block">
          Uso interno · Personal administrativo
        </p>
      </div>

      {/* Formulario: superficie normal, respeta el tema igual que el
          resto de la app (a diferencia del panel de la izquierda). */}
      <div className="flex flex-1 items-center justify-center bg-superficie px-6 py-12 md:px-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-texto">Inicia sesión</h1>
          <p className="mt-1 text-sm text-texto-secundario">
            Con tu usuario del directorio.
          </p>

          <form onSubmit={manejarEnvio} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="nombreUsuario" className="block text-sm text-texto-secundario">
                Usuario
              </label>
              <input
                id="nombreUsuario"
                type="text"
                value={nombreUsuario}
                onChange={(evento) => setNombreUsuario(evento.target.value)}
                autoComplete="username"
                autoFocus
                className="mt-1.5 w-full rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-2 text-sm text-texto outline-none focus-visible:ring-2 focus-visible:ring-acento"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm text-texto-secundario">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-[var(--radius-control)] border border-borde bg-hoja px-3 py-2 text-sm text-texto outline-none focus-visible:ring-2 focus-visible:ring-acento"
              />
            </div>

            {error && (
              <p
                className="border-l-2 border-destructivo py-1 pl-3 text-sm text-destructivo"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-[var(--radius-control)] bg-acento py-2.5 text-sm font-medium text-acento-texto outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-superficie disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
