import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../api/client';

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  /** Admin: list users, update roles, view system health. */
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = 'Admin • VaultMate'; }, []);

  async function load() {
    setErr(null);
    try {
      const [u, h] = await Promise.all([apiGet('/admin/users', true), apiGet('/admin/health', true)]);
      setUsers(u); setHealth(h);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function updateRoles(userId, rolesCsv) {
    setBusy(true); setErr(null);
    try {
      const roles = rolesCsv.split(',').map(s => s.trim()).filter(Boolean);
      await apiPost('/admin/users/roles', { user_id: userId, roles }, true);
      await load();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid" style={{gap:'1rem'}}>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
          <h2 style={{margin:0}}>Users</h2>
          <button className="btn muted" onClick={load}>Refresh</button>
        </div>
        {err && <div className="alert error">{err}</div>}
        <div style={{overflowX:'auto'}}>
          <table className="table" aria-label="Users">
            <thead>
              <tr><th>Email</th><th>Roles</th><th>MFA</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.email}</td>
                  <td>{(u.roles || []).join(', ') || 'user'}</td>
                  <td>{u.mfa_enabled ? 'Enabled' : 'Disabled'}</td>
                  <td style={{display:'flex', gap:8}}>
                    <RoleEditor initial={(u.roles || []).join(', ')} onSave={(csv) => updateRoles(u.user_id, csv)} busy={busy} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4">No users.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>System health</h2>
        <pre style={{whiteSpace:'pre-wrap'}}>{health ? JSON.stringify(health, null, 2) : 'Loading…'}</pre>
      </div>
    </div>
  );
}

function RoleEditor({ initial, onSave, busy }) {
  const [val, setVal] = useState(initial);
  return (
    <div style={{display:'flex', gap:6}}>
      <input aria-label="Roles CSV" value={val} onChange={e=>setVal(e.target.value)} />
      <button className="btn secondary" disabled={busy} onClick={() => onSave(val)}>Save</button>
    </div>
  );
}
