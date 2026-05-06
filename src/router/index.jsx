import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Pages (to be created per feature)
// import LoginPage from '../features/auth/pages/LoginPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <div>Login Page — coming soon</div>,
  },
  {
    path: '/',
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