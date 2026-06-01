import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const normalizedRoles = (user?.roles || []).map((role) => role.replace(/^ROLE_/, ''));
  const effectiveRole = user?.role || normalizedRoles[0];

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles) {
    const hasRole = allowedRoles.includes(effectiveRole)
      || normalizedRoles.some((role) => allowedRoles.includes(role));
    if (!hasRole) return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
