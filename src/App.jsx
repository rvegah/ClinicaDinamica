import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppRoutes from './app/AppRoutes';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si el usuario ya estaba autenticado al refrescar
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const wasAlreadyAuthenticated = sessionStorage.getItem('wasAlreadyAuthenticated');

    if (isAuthenticated && !wasAlreadyAuthenticated && location.pathname !== '/') {
      // Primera carga después de login, redirigir al dashboard
      sessionStorage.setItem('wasAlreadyAuthenticated', 'true');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, location.pathname]);

  return <AppRoutes />;
}

export default App;