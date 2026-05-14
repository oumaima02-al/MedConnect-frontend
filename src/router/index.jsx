import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LandingPage  from '../features/landing/pages/LandingPage';
import AuthPage     from '../features/auth/pages/AuthPage';
import AppLayout    from '../components/layout/AppLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';

const router = createBrowserRouter([

  // ── Public routes ─────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },

  // ── Protected routes (all roles) ──────────────
  {
    path: '/app',
    element: (
      <PrivateRoute allowedRoles={['PATIENT', 'DOCTOR', 'PHARMACIST']} />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard',       element: <DashboardPage /> },

          // Patient
          { path: 'appointments',    element: <div style={{padding:24,fontFamily:'DM Sans'}}>Rendez-vous — coming soon</div> },
          { path: 'medical-records', element: <div style={{padding:24,fontFamily:'DM Sans'}}>Dossier médical — coming soon</div> },
          { path: 'prescriptions',   element: <div style={{padding:24,fontFamily:'DM Sans'}}>Ordonnances — coming soon</div> },
          { path: 'messages',        element: <div style={{padding:24,fontFamily:'DM Sans'}}>Messagerie — coming soon</div> },

          // Doctor
          { path: 'patients',        element: <div style={{padding:24,fontFamily:'DM Sans'}}>Mes patients — coming soon</div> },
          { path: 'schedule',        element: <div style={{padding:24,fontFamily:'DM Sans'}}>Planning — coming soon</div> },
        ],
      },
    ],
  },

  // ── 404 ───────────────────────────────────────
  {
    path: '*',
    element: (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'DM Sans', gap:16 }}>
        <div style={{ fontFamily:'Sora', fontSize:'4rem', fontWeight:800, color:'#111827' }}>404</div>
        <p style={{ color:'#9ca3af' }}>Page introuvable</p>
        <a href="/" style={{ color:'#2ecc71', fontWeight:600 }}>Retour à l'accueil</a>
      </div>
    ),
  },
]);

export default router;