import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LandingPage  from '../features/landing/pages/LandingPage';
import AuthPage     from '../features/auth/pages/AuthPage';
import AppLayout    from '../components/layout/AppLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import PatientProfilePage from '../features/patient/pages/PatientProfilePage';
import DoctorSearchPage from '../features/doctors/pages/DoctorSearchPage';
import MedicalRecordsPage from '../features/medical-records/pages/MedicalRecordsPage';
import PrescriptionsPage from '../features/prescriptions/pages/PrescriptionsPage';
import AppointmentsPage from '../features/appointments/pages/AppointmentsPage';
import TeleconsultPage from '../features/teleconsult/pages/TeleconsultPage';
import BecomeDoctorPage from '../features/become-doctor/pages/BecomeDoctorPage';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage';
import PatientDmpPage from '../features/patient/pages/PatientDmpPage';
import VitalsPage from '../features/patient/pages/VitalsPage';
import DoctorPatientView from '../features/doctor/pages/DoctorPatientView';
import ConsultationPage from '../features/doctor/pages/ConsultationPage';
import CreatePrescriptionPage from '../features/doctor/pages/CreatePrescriptionPage';
import ConsentPage from '../features/patient/pages/ConsentPage';
import PatientDocumentsPage from '../features/patient/pages/PatientDocumentsPage';
import PatientAllergiesPage from '../features/patient/pages/PatientAllergiesPage';
import MessagingPage from '../features/messaging/pages/MessagingPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';

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
        <PrivateRoute allowedRoles={['PATIENT', 'DOCTOR', 'PHARMACIST', 'USER']} />
      ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard',       element: <DashboardPage /> },

          // Patient
          { path: 'appointments',    element: <AppointmentsPage /> },
          { path: 'medical-records', element: <MedicalRecordsPage /> },
          { path: 'prescriptions',   element: <PrescriptionsPage /> },
          { path: 'teleconsult',     element: <TeleconsultPage /> },
          { path: 'messages',        element: <MessagingPage /> },
          { path: 'notifications',    element: <NotificationsPage /> },

          // Doctor
          { path: 'patients',        element: <div style={{padding:24,fontFamily:'DM Sans'}}>Mes patients — coming soon</div> },
          { path: 'schedule',        element: <AppointmentsPage /> },
           
          { path: 'profile', element: <ProfilePage /> },

          { path: 'patient-profile', element: <PatientProfilePage /> },
          { path: 'become-doctor',   element: <BecomeDoctorPage /> },

          { path: 'doctors', element: <DoctorSearchPage /> },
        ],
      },
    ],
  },

  // ── Patient Space ──────────────────────────────
  {
    path: '/patient',
    element: <PrivateRoute allowedRoles={['PATIENT', 'USER', 'ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'dmp',       element: <PatientDmpPage /> },
          { path: 'vitals',    element: <VitalsPage /> },
          { path: 'consent',   element: <ConsentPage /> },
          { path: 'documents', element: <PatientDocumentsPage /> },
          { path: 'allergies', element: <PatientAllergiesPage /> },
        ],
      },
    ],
  },

  // ── Doctor Space ───────────────────────────────
  {
    path: '/doctor',
    element: <PrivateRoute allowedRoles={['DOCTOR', 'ADMIN']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard',         element: <DashboardPage /> },
          { path: 'patients/:id',      element: <DoctorPatientView /> },
          { path: 'patients/:id/consultation', element: <ConsultationPage /> },
          { path: 'patients/:id/prescription', element: <CreatePrescriptionPage /> },
          { path: 'consultations',     element: <div style={{padding:24}}>Mes consultations — soon</div> },
          { path: 'prescriptions',     element: <PrescriptionsPage /> },
        ],
      },
    ],
  },

  // ── Admin routes ────────────────────────────────
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['ADMIN']} />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <AdminUsersPage /> },
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
