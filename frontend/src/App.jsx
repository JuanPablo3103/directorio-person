// Componente raíz: define el enrutador de la aplicación y envuelve todo
// en el proveedor de autenticación, para que cualquier página pueda
// acceder a la sesión con el hook useAuth.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RutaProtegida from './components/RutaProtegida';
import Shell from './components/Shell';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import ListadoPersonas from './pages/ListadoPersonas';
import DetallePersona from './pages/DetallePersona';
import RegistrarPersona from './pages/RegistrarPersona';
import EditarPersona from './pages/EditarPersona';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
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
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
