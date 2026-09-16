// Contexto de tema (claro/oscuro): guarda la preferencia en localStorage
// y la aplica como clase "dark" en <html>, que es lo que activa las
// variantes dark: de Tailwind (ver @custom-variant en index.css).
//
// El primer pintado ya sale con el tema correcto porque un script inline
// en index.html decide la clase "dark" antes de que React se monte (ver
// ese archivo). Este contexto no repite esa lógica de "qué prefiere el
// usuario": al montar, simplemente lee qué clase quedó puesta y sigue
// desde ahí, para no tener el cálculo de preferencia duplicado en dos
// lugares que podrían desincronizarse.

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function leerTemaActual() {
  return document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro';
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(leerTemaActual);

  // Cada cambio de tema se refleja en la clase de <html> (para Tailwind)
  // y en localStorage (para que sobreviva a un refresco o a una sesión
  // nueva en el mismo navegador).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro');
    localStorage.setItem('tema', tema);
  }, [tema]);

  function alternarTema() {
    setTema((temaActual) => (temaActual === 'oscuro' ? 'claro' : 'oscuro'));
  }

  const valor = { tema, esOscuro: tema === 'oscuro', alternarTema };

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

// Hook de conveniencia, mismo patrón que useAuth: evita repetir
// useContext(ThemeContext) y falla temprano si se usa fuera del proveedor.
export function useTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider.');
  }

  return contexto;
}
