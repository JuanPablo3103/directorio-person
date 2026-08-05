// Componente raíz: define el enrutador de la aplicación y envuelve todo
// en el proveedor de autenticación, para que cualquier página pueda
// acceder a la sesión con el hook useAuth.

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import ListadoPersonas from './pages/ListadoPersonas';
import DetallePersona from './pages/DetallePersona';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública: no pasa por RutaProtegida */}
          <Route path="/login" element={<Login />} />

          {/* Rutas privadas: comparten RutaProtegida como layout route,
              así que ambas exigen sesión activa sin repetir la validación */}
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<ListadoPersonas />} />
            <Route path="/personas/:id" element={<DetallePersona />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
