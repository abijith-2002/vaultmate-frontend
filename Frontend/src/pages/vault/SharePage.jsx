import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { apiPost } from '../../api/client';

// PUBLIC_INTERFACE
export default function SharePage() {
  /** Share/unshare a vault item with another user by email. */
  const { items } = useVault();
  const [itemId, setItemId] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function share() {
    setMsg(null); setErr(null);
    try {
      const res = await apiPost('/sharing/share', { item_id: itemId, target_user_email: email }, true);
      setMsg(res.message || 'Shared successfully.');
    } catch (e) {
      setErr(e.message);
    }
  }

  async function unshare() {
    setMsg(null); setErr(null);
    try {
      const res = await apiPost('/sharing/unshare', { item_id: itemId, target_user_email: email }, true);
      setMsg(res.message || 'Sharing revoked.');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Sharing</h2>
      <p className="text-muted">Grant or revoke access to your items.</p>
      {msg && <div className="alert success">{msg}</div>}
      {err && <div className="alert error">{err}</div>}

      <div className="grid" style={{gap:'0.75rem'}}>
        <div className="form-field">
          <label htmlFor="item">Select item</label>
          <select id="item" value={itemId} onChange={e=>setItemId(e.target.value)}>
            <option value="">Choose…</option>
            {items.map(i => <option key={i.item_id} value={i.item_id}>{i.title} — {i.username}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="email">User email</label>
          <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn" onClick={share} disabled={!itemId || !email}>Share</button>
          <button className="btn danger" onClick={unshare} disabled={!itemId || !email}>Unshare</button>
        </div>
      </div>
    </div>
  );
}
