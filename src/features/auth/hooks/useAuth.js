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
      if (data.mfaRequired) {
        return { mfaRequired: true, sessionToken: data.sessionToken, email };
      }

      // Normal login — save & redirect
      authService.saveSession(data);
      login(data.user, data.accessToken);

      const role = data.user?.role?.toLowerCase();
      navigate('/app/dashboard');
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
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de l'inscription";
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
      const msg = err.response?.data?.error || 'Code invalide ou expiré';
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