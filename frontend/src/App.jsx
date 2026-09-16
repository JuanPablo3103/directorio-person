// Componente raíz: define el enrutador de la aplicación y envuelve todo
// en el proveedor de autenticación, para que cualquier página pueda
// acceder a la sesión con el hook useAuth.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';
import RutaProtegida from './components/RutaProtegida';
import Shell from './components/Shell';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import NoEncontrado from './pages/NoEncontrado';
import ListadoPersonas from './pages/ListadoPersonas';
import DetallePersona from './pages/DetallePersona';
import RegistrarPersona from './pages/RegistrarPersona';
import EditarPersona from './pages/EditarPersona';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <Routes>
                {/* Ruta pública: no pasa por RutaProtegida ni lleva el Shell */}
                <Route path="/login" element={<Login />} />

                {/* Rutas privadas: RutaProtegida exige sesión; Shell, anidado
                    adentro, pone el riel de navegación y la barra de contexto
                    alrededor de cualquier ruta hija. Son dos layout routes
                    separadas a propósito: una decide "¿hay sesión?", la otra
                    decide "¿qué chrome envuelve el contenido?". */}
                <Route element={<RutaProtegida />}>
                  <Route element={<Shell />}>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/personas" element={<ListadoPersonas />} />
                    <Route path="/personas/nueva" element={<RegistrarPersona />} />
                    <Route path="/personas/:id" element={<DetallePersona />} />
                    <Route path="/personas/:id/editar" element={<EditarPersona />} />
                    {/* Cualquier otra ruta, ya autenticado: 404 con el chrome
                        completo (riel, barra de contexto), no una página en blanco. */}
                    <Route path="*" element={<NoEncontrado />} />
                  </Route>
                </Route>
              </Routes>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
