import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LandingPage            from '../features/landing/pages/LandingPage';
import AuthPage               from '../features/auth/pages/AuthPage';
import AppLayout              from '../components/layout/AppLayout';
import DashboardPage          from '../features/dashboard/pages/DashboardPage';
import ProfilePage            from '../features/profile/pages/ProfilePage';
import PatientProfilePage     from '../features/patient/pages/PatientProfilePage';
import DoctorSearchPage       from '../features/doctors/pages/DoctorSearchPage';
import DoctorOnboardingPage   from '../features/doctors/pages/DoctorOnboardingPage';
import PharmacistOnboardingPage from '../features/profile/pages/PharmacistOnboardingPage';
import AdminUsersPage         from '../features/admin/pages/AdminUsersPage';

const router = createBrowserRouter([

  // ── Public routes ─────────────────────────────────────────
  { path: '/',      element: <LandingPage /> },
  { path: '/login', element: <AuthPage /> },

  // ── Doctor onboarding (after first login) ─────────────────
  {
    path: '/onboarding/doctor',
    element: <PrivateRoute allowedRoles={['DOCTOR']} />,
    children: [{ index: true, element: <DoctorOnboardingPage /> }],
  },

  // ── Pharmacist onboarding ─────────────────────────────────
  {
    path: '/onboarding/pharmacist',
    element: <PrivateRoute allowedRoles={['PHARMACIST']} />,
    children: [{ index: true, element: <PharmacistOnboardingPage /> }],
  },

  // ── Protected routes (Patient / Doctor / Pharmacist) ──────
  {
    path: '/app',
    element: <PrivateRoute allowedRoles={['USER', 'PATIENT', 'DOCTOR', 'PHARMACIST']} />,
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

          // Common
          { path: 'profile',         element: <ProfilePage /> },
          { path: 'patient-profile', element: <PatientProfilePage /> },
          { path: 'doctors',         element: <DoctorSearchPage /> },
        ],
      },
    ],
  },

  // ── Admin panel ───────────────────────────────────────────
  {
    path: '/admin',
    element: <PrivateRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,       element: <AdminUsersPage /> },
          { path: 'users',     element: <AdminUsersPage /> },
        ],
      },
    ],
  },

  // ── Unauthorized ──────────────────────────────────────────
  {
    path: '/unauthorized',
    element: (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'DM Sans', gap:16 }}>
        <div style={{ fontFamily:'Sora', fontSize:'4rem', fontWeight:800, color:'#e74c3c' }}>403</div>
        <p style={{ color:'#111827', fontWeight:600 }}>Accès non autorisé</p>
        <p style={{ color:'#9ca3af', maxWidth:320, textAlign:'center' }}>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <a href="/" style={{ color:'#2ecc71', fontWeight:600 }}>Retour à l'accueil</a>
      </div>
    ),
  },

  // ── 404 ──────────────────────────────────────────────────
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