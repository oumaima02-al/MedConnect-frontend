import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../../../context/AuthContext';

// ─── LOGIN HOOK ───────────────────────────────────────────
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.login({ email, password });

      // MFA required
      if (data.requiresOtp || data.mfaRequired) {
        return { mfaRequired: true, sessionToken: data.sessionToken || '', email };
      }

      // Normal login — save & redirect
      authService.saveSession(data);
      
      const token = data.token || data.accessToken;
      const normalizedRole = (data.user?.role || data.roles?.[0] || '').replace('ROLE_', '');
      const userObj = data.user || {
        id: data.id || data.userId,
        email: data.email,
        role: normalizedRole,
      };

      login(userObj, token);

      const role = normalizedRole.toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app/dashboard');
      }
      return { success: true, role };

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur de connexion';
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error, setError };
}

// ─── REGISTER HOOK ───────────────────────────────────────
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await authService.signup(formData);
      return { success: true };
    } catch (err) {
      let msg = "Erreur lors de l'inscription";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data)
            .filter(([key]) => key !== 'error' && key !== 'message' && key !== 'status' && key !== 'timestamp' && key !== 'path')
            .map(([key, val]) => `${val}`)
            .join(' | ');
          msg = err.response.data.message || err.response.data.error || fieldErrors || JSON.stringify(err.response.data);
        }
      }
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error, setError };
}

// ─── OTP HOOK ────────────────────────────────────────────
export function useOtpVerification() {
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [resendCool, setResendCool] = useState(0);
  const navigate = useNavigate();

  const handleVerify = async ({ email, otp }) => {
    setLoading(true);
    setError('');
    try {
      await authService.verifyEmail({ email, otp });
      navigate('/login?verified=true');
      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      const backendMsg = err.response?.data?.error || err.response?.data?.message;

      let msg;
      if (backendMsg) {
        // Show exact backend message
        msg = backendMsg;
      } else if (status === 500 || status === 503) {
        // Kafka or server down — don't say "expired"
        msg = 'Erreur serveur (service indisponible). Vérifiez que Kafka et les services backend sont démarrés.';
      } else if (!err.response) {
        // Network error — backend unreachable
        msg = 'Impossible de joindre le serveur. Vérifiez que le backend est démarré sur le port 8080.';
      } else {
        msg = 'Code invalide ou expiré. Utilisez "Renvoyer" pour obtenir un nouveau code.';
      }

      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async ({ email }) => {
    if (resendCool > 0) return;
    try {
      await authService.resendOtp({ email });
      // cooldown 60s
      setResendCool(60);
      const interval = setInterval(() => {
        setResendCool(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Impossible de renvoyer le code');
    }
  };

  return { handleVerify, handleResend, loading, error, setError, resendCool };
}

// ─── FORGOT PASSWORD HOOK ────────────────────────────────
export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  const handleForgot = async ({ email }) => {
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la demande';
      setError(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { handleForgot, loading, error, sent };
}