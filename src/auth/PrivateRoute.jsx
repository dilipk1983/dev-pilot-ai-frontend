// auth/PrivateRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, isAuthReady } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
