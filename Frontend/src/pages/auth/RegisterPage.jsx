import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function RegisterPage() {
  /** Registration form; supports optional full name. */
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { document.title = 'Register • VaultMate'; }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await register({ email, password, full_name: fullName || null });
    if (!res.ok) setMsg(res.error || 'Registration failed');
    else setMsg('Account created. Check your email to confirm (if required), then sign in.');
  }

  return (
    <form onSubmit={onSubmit} className="stack" aria-labelledby="register-title">
      <h1 id="register-title" className="visually-hidden">Register</h1>
      {error && <div className="alert error" role="alert">{error}</div>}
      {msg && <div className="alert info">{msg}</div>}
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password (min 8 chars)</label>
        <input id="password" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>
      <div className="form-field">
        <label htmlFor="fullName">Full name (optional)</label>
        <input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Jane Doe" />
      </div>
      <button className="btn full" type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Creating…' : 'Create Account'}
      </button>
    </form>
  );
}
