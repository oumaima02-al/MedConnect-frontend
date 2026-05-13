import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LandingPage from '../features/landing/pages/LandingPage';
import AuthPage from '../features/auth/pages/AuthPage';
const router = createBrowserRouter([
  // Landing — publique, pas de auth
  {
    path: '/',
    element: <LandingPage />,
  },

  // Login — publique
  { path: '/login', element: <AuthPage /> },

  // Routes protégées
  {
    path: '/app',
    element: <PrivateRoute allowedRoles={['patient', 'doctor', 'pharmacy']} />,
    children: [
      {
        path: 'dashboard',
        element: <div>Dashboard — coming soon</div>,
      },
    ],
  },
  
]);

export default router;