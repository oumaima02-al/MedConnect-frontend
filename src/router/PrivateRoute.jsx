import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../features/doctors/services/doctorService';
import { pharmacistService } from '../features/profile/services/pharmacistService';

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setChecking(false);
      return;
    }

    const role = user.role;
    if (role !== 'DOCTOR' && role !== 'PHARMACIST') {
      setOnboarded(true);
      setChecking(false);
      return;
    }

    // Check localStorage cache
    const cached = localStorage.getItem(`dawini_onboarded_${user.id}`);
    if (cached === 'true') {
      setOnboarded(true);
      setChecking(false);
      return;
    }

    let active = true;
    const checkProfile = async () => {
      try {
        if (role === 'DOCTOR') {
          await doctorService.getProfile(user.id);
        } else if (role === 'PHARMACIST') {
          await pharmacistService.getProfile(user.id);
        }
        if (active) {
          localStorage.setItem(`dawini_onboarded_${user.id}`, 'true');
          setOnboarded(true);
        }
      } catch (err) {
        // If profile doesn't exist, they are not onboarded
        if (active) {
          setOnboarded(false);
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkProfile();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32,
            border: '3px solid rgba(46,204,113,0.2)',
            borderTopColor: '#2ecc71',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>Vérification du profil...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isUnderOnboarding = location.pathname.startsWith('/onboarding');
  const role = user?.role;

  if (role === 'DOCTOR' || role === 'PHARMACIST') {
    if (onboarded && isUnderOnboarding) {
      // Onboarded users trying to access onboarding page -> send to dashboard
      return <Navigate to="/app/dashboard" replace />;
    }
    if (!onboarded && !isUnderOnboarding) {
      // Unonboarded users trying to access app pages -> send to onboarding
      const target = role === 'DOCTOR' ? '/onboarding/doctor' : '/onboarding/pharmacist';
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;