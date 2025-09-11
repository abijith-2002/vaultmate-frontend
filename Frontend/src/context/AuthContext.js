import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../api/supabase';

const AuthContext = createContext(null);

// Map Supabase user/session to lightweight profile the UI expects
async function toProfile(session) {
  if (!session) return null;
  const { user } = session;
  if (!user) return null;
  // Basic profile derived from Supabase auth user
  return {
    user_id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || null,
    roles: [], // Supabase doesn't carry custom roles here; keep empty for now
    mfa_enabled: false, // Not implemented with Supabase in this UI version
  };
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions. */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides authentication state, user profile, and auth actions (Supabase-based). */
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const supabase = getSupabase();

  const loadProfile = useCallback(async () => {
    try {
      const { data: { session }, error: sError } = await supabase.auth.getSession();
      if (sError) throw sError;
      const profile = await toProfile(session);
      setUser(profile);
      setIsAuthed(!!profile);
    } catch (e) {
      // On any error, treat as logged out
      setUser(null);
      setIsAuthed(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial session load
    loadProfile();

    // Subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      toProfile(session).then((p) => {
        setUser(p);
        setIsAuthed(!!p);
      }).catch(() => {
        setUser(null);
        setIsAuthed(false);
      });
    });
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [supabase, loadProfile]);

  // PUBLIC_INTERFACE
  async function login({ email, password }) {
    /** Login with Supabase email/password. */
    setLoading(true); setError(null);
    try {
      const { data, error: lerr } = await supabase.auth.signInWithPassword({ email, password });
      if (lerr) throw lerr;
      // Session change event will update profile
      return { ok: true, data };
    } catch (e) {
      const message = e?.message || 'Login failed';
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function register({ email, password, full_name }) {
    /** Register using Supabase Auth; sets user_metadata.full_name if provided. */
    setLoading(true); setError(null);
    try {
      const { data, error: rerr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: full_name || undefined },
          // To use email confirmations, you may set emailRedirectTo using SITE_URL env mapped at deploy.
          // emailRedirectTo: process.env.REACT_APP_SITE_URL ? `${process.env.REACT_APP_SITE_URL}/login` : undefined,
        }
      });
      if (rerr) throw rerr;
      // Depending on project settings, user may be confirmed automatically or require email confirmation.
      // If session is returned, onAuthStateChange will populate profile; otherwise prompt user.
      await loadProfile();
      return { ok: true, data };
    } catch (e) {
      const message = e?.message || 'Registration failed';
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function startMFASetup() {
    /**
     * Placeholder: Supabase MFA not wired in this UI version.
     * Returning a friendly message to the caller.
     */
    throw new Error('MFA setup is not available with Supabase in this UI.');
  }

  // PUBLIC_INTERFACE
  async function verifyMFA(_otp) {
    /**
     * Placeholder: Supabase MFA not wired in this UI version.
     */
    throw new Error('MFA verification is not available with Supabase in this UI.');
  }

  // PUBLIC_INTERFACE
  async function logout() {
    /** Sign out via Supabase and reset local state. */
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthed(false);
  }

  const value = { user, isAuthed, loading, error, login, register, startMFASetup, verifyMFA, logout, reloadProfile: loadProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
