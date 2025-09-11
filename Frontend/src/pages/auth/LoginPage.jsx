import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login form with email and password (no MFA OTP field). */
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => { document.title = 'Login • VaultMate'; }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await login({ email, password });
    if (!res.ok) setMessage(res.error || 'Login failed');
  }

  return (
    <form onSubmit={onSubmit} className="stack" aria-labelledby="login-title">
      <h1 id="login-title" className="visually-hidden">Login</h1>
      {error && <div className="alert error" role="alert">{error}</div>}
      {message && <div className="alert info">{message}</div>}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
      </div>
      <button className="btn full" type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <small className="text-muted">If your project requires email confirmation, verify your email before logging in.</small>
    </form>
  );
}
