// Página de inicio de sesión.

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-semibold text-gray-800">
          Directorio Person
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Gerencia de Proyectos de Software
        </p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="nombreUsuario"
              type="text"
              value={nombreUsuario}
              onChange={(evento) => setNombreUsuario(evento.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-md bg-gray-800 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
