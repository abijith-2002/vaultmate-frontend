import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login form supporting MFA OTP input. */
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => { document.title = 'Login • VaultMate'; }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await login({ email, password, mfa_otp: otp || undefined });
    if (!res.ok) setMessage(res.error || 'Login failed');
  }

  return (
    <section className="grid" aria-labelledby="login-title">
      <h1 id="login-title" className="visually-hidden">Login</h1>
      <div className="card" role="region" aria-label="Login form">
        <h2>Welcome back</h2>
        <p className="text-muted">Securely access your credentials.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        {message && <div className="alert info">{message}</div>}
        <form onSubmit={onSubmit} className="grid" style={{gap:'0.75rem'}}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="otp">MFA OTP (if enabled)</label>
            <input id="otp" inputMode="numeric" pattern="[0-9]*" value={otp} onChange={e=>setOtp(e.target.value)} aria-describedby="otp-help" />
            <span id="otp-help" className="visually-hidden">Enter one time passcode from your authenticator if your account has MFA enabled.</span>
          </div>
          <div>
            <button className="btn" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
