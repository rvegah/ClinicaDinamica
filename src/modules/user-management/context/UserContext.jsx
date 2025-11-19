// UserContext.jsx - Contexto para compartir el estado de usuarios entre componentes

import React, { createContext, useContext } from 'react';
import { useUsers as useUsersHook } from '../hooks/useUsers';

// Crear el contexto
const UserContext = createContext();

// Provider que envuelve la aplicación
export const UserProvider = ({ children }) => {
  const userState = useUsersHook();
  
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers debe usarse dentro de un UserProvider');
  }
  return context;
};