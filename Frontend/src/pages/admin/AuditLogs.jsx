import React, { useEffect, useState } from 'react';
import { apiGet } from '../../api/client';

// PUBLIC_INTERFACE
export default function AuditLogs() {
  /** Admin: view audit logs. */
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => { document.title = 'Audit Logs • VaultMate'; }, []);

  async function load() {
    setErr(null);
    try {
      const res = await apiGet('/audit/logs', true);
      setLogs(res);
    } catch (e) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <h2 style={{margin:0}}>Audit logs</h2>
        <button className="btn muted" onClick={load}>Refresh</button>
      </div>
      {err && <div className="alert error">{err}</div>}
      <div style={{overflowX:'auto'}}>
        <table className="table" aria-label="Audit logs">
          <thead>
            <tr>
              <th>When</th><th>Actor</th><th>Action</th><th>Resource</th><th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, idx) => (
              <tr key={idx}>
                <td>{new Date(l.when).toLocaleString()}</td>
                <td>{l.actor || '-'}</td>
                <td>{l.action}</td>
                <td>{l.resource || '-'}</td>
                <td>{l.ip || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan="5">No logs.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
