// Página de inicio de sesión.

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { estaAutenticado, iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');

    if (!nombreUsuario.trim() || !contrasena.trim()) {
      setError('Debes ingresar usuario y contraseña.');
      return;
    }

    setEnviando(true);

    try {
      await iniciarSesion(nombreUsuario.trim(), contrasena);
      navigate('/', { replace: true });
    } catch (errorPeticion) {
      if (errorPeticion.response?.status === 401) {
        setError('Usuario o contraseña incorrectos.');
      } else if (!errorPeticion.response) {
        setError('No se pudo conectar con el servidor. Intenta más tarde.');
      } else {
        setError('Ocurrió un error inesperado. Intenta nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Panel de marca — oculto en móvil */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Users className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold">Directorio Person</span>
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-base font-medium text-brand-100 backdrop-blur">
            <Sparkles className="h-5 w-5" />
            Gerencia de Proyectos de Software
          </span>
          <h2 className="mt-8 max-w-lg text-5xl font-bold leading-tight text-white">
            Toda tu base de contactos, organizada y a un clic de distancia.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-brand-100">
            Busca, filtra y administra empleados, clientes y proveedores desde un solo lugar.
          </p>
        </div>

        <p className="relative text-sm text-brand-200">
          © {new Date().getFullYear()} Directorio Person. Todos los derechos reservados.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center text-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Users className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-800">Directorio Person</h1>
          </div>

          <h2 className="text-3xl font-bold text-slate-800">Bienvenido de nuevo</h2>
          <p className="mt-2 text-base text-slate-500">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={manejarEnvio} className="mt-10 space-y-5" noValidate>
            <div>
              <label htmlFor="nombreUsuario" className="mb-2 block text-base font-medium text-slate-700">
                Usuario
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="nombreUsuario"
                  type="text"
                  value={nombreUsuario}
                  onChange={(evento) => setNombreUsuario(evento.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 text-base text-slate-800 shadow-sm transition-shadow focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-2 block text-base font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 py-3.5 pl-12 pr-4 text-base text-slate-800 shadow-sm transition-shadow focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-base font-medium text-rose-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
              {!enviando && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;