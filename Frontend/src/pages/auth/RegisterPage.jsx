import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function RegisterPage() {
  /** Registration form; supports optional full name and admin invite code. */
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [invite, setInvite] = useState('');
  const [msg, setMsg] = useState(null);

  useEffect(() => { document.title = 'Register • VaultMate'; }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const res = await register({ email, password, full_name: fullName || null, admin_invite_code: invite || null });
    if (!res.ok) setMsg(res.error || 'Registration failed');
  }

  return (
    <section className="grid">
      <div className="card">
        <h2>Create your VaultMate account</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        {msg && <div className="alert info">{msg}</div>}
        <form onSubmit={onSubmit} className="grid" style={{gap:'0.75rem'}}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password (min 8 chars)</label>
            <input id="password" type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="fullName">Full name (optional)</label>
            <input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="invite">Admin invite code (optional)</label>
            <input id="invite" value={invite} onChange={e=>setInvite(e.target.value)} />
          </div>
          <div>
            <button className="btn" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
