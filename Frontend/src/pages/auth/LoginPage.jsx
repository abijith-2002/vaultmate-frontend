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
      <div className="form-field">
        <label htmlFor="otp">MFA OTP (if enabled)</label>
        <input id="otp" inputMode="numeric" pattern="[0-9]*" value={otp} onChange={e=>setOtp(e.target.value)} aria-describedby="otp-help" placeholder="123456" />
        <span id="otp-help" className="visually-hidden">Enter one time passcode from your authenticator if your account has MFA enabled.</span>
      </div>
      <button className="btn full" type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
