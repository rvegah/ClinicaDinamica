// src/app/ThemeContext.jsx
// Context para manejar el tema claro/oscuro - SI CLINICA FARMA

import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const ThemeModeContext = createContext();

// Provider del contexto
export const ThemeModeProvider = ({ children }) => {
  // Leer el modo guardado en localStorage o usar 'light' por defecto
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Guardar el modo en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Función para alternar entre modo claro y oscuro
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Función para establecer un modo específico
  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };

  const value = {
    mode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  
  if (context === undefined) {
    throw new Error('useThemeMode debe usarse dentro de un ThemeModeProvider');
  }
  
  return context;
};

export default ThemeModeContext;