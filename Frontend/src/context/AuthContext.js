import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '../api/client';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions. */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state, user profile, and auth actions. */
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('vm_access'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!localStorage.getItem('vm_access')) return;
    try {
      const profile = await apiGet('/me', true);
      setUser(profile);
      setIsAuthed(true);
    } catch (e) {
      // token invalid; try refresh once
      const refresh = localStorage.getItem('vm_refresh');
      if (refresh) {
        try {
          const pair = await apiPost('/auth/refresh', { refresh_token: refresh }, false);
          localStorage.setItem('vm_access', pair.access_token);
          localStorage.setItem('vm_refresh', pair.refresh_token);
          const profile2 = await apiGet('/me', true);
          setUser(profile2);
          setIsAuthed(true);
          return;
        } catch {
          // fallthrough to logout
        }
      }
      logout();
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // PUBLIC_INTERFACE
  async function login({ email, password, mfa_otp }) {
    /** Login. If MFA required, backend may return tokens with step-up. */
    setLoading(true); setError(null);
    try {
      const pair = await apiPost('/auth/login', { email, password, mfa_otp }, false);
      localStorage.setItem('vm_access', pair.access_token);
      localStorage.setItem('vm_refresh', pair.refresh_token);
      await loadProfile();
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message, status: e.status };
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function register({ email, password, full_name }) {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/register', { email, password, full_name }, false);
      // Auto-login after registration
      return await login({ email, password });
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function startMFASetup() {
    /** Begin MFA setup for current user. */
    return apiPost('/auth/mfa/setup', {}, true);
  }

  // PUBLIC_INTERFACE
  async function verifyMFA(otp) {
    /** Verify MFA code to enable MFA. */
    return apiPost('/auth/mfa/verify', { otp }, true);
  }

  // PUBLIC_INTERFACE
  function logout() {
    /** Clear tokens and user. */
    localStorage.removeItem('vm_access');
    localStorage.removeItem('vm_refresh');
    setUser(null);
    setIsAuthed(false);
  }

  const value = { user, isAuthed, loading, error, login, register, startMFASetup, verifyMFA, logout, reloadProfile: loadProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
