import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVault } from '../../context/VaultContext';
import { apiGet, apiPost } from '../../api/client';
import { maskSecret } from '../../utils/password';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Shows vault items, password generator, and strength estimator. */
  const { items, loading, lastError, refresh, deleteItem } = useVault();
  const [query, setQuery] = useState('');
  const [gen, setGen] = useState({ length: 16, uppercase: true, lowercase: true, digits: true, symbols: true });
  const [generated, setGenerated] = useState('');
  const [strength, setStrength] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => { document.title = 'Vault • VaultMate'; }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.username.toLowerCase().includes(q) ||
      (i.url || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  async function doGenerate() {
    const res = await apiPost('/vault/passwords/generate', gen, false);
    setGenerated(res.password);
    setStrength(null);
  }

  async function checkStrength() {
    if (!generated) return;
    const params = new URLSearchParams({ password: generated, min_length: '12' });
    const res = await apiGet(`/vault/passwords/strength?${params.toString()}`, false);
    setStrength(res);
  }

  return (
    <div className="grid" style={{gap:'1rem'}}>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <h2 style={{margin:0}}>Your Vault</h2>
          <div style={{display:'flex',gap:8}}>
            <Link to="/vault/new" className="btn">+ Add Item</Link>
            <button className="btn muted" onClick={refresh} aria-busy={loading}>Refresh</button>
          </div>
        </div>
        {lastError && <div className="alert error" role="alert">{lastError}</div>}
        <div className="form-field" style={{marginTop:8}}>
          <label htmlFor="search">Search</label>
          <input id="search" placeholder="Find by title, username, or URL" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div style={{overflowX:'auto', marginTop:12}}>
          <table className="table" role="table" aria-label="Vault items">
            <thead>
              <tr>
                <th>Title</th>
                <th>Username</th>
                <th>URL</th>
                <th>Secret</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.item_id}>
                  <td>{item.title}</td>
                  <td>{item.username}</td>
                  <td>{item.url || '-'}</td>
                  <td>
                    <code>{maskSecret(show, item.secret_ciphertext.slice(0, 12))}</code>
                  </td>
                  <td style={{display:'flex',gap:6}}>
                    <Link className="btn secondary" to={`/vault/${item.item_id}`}>Edit</Link>
                    <button className="btn muted" onClick={() => navigator.clipboard.writeText(item.username)} aria-label="Copy username">Copy U</button>
                    <button className="btn muted" onClick={() => navigator.clipboard.writeText(item.secret_ciphertext)} aria-label="Copy secret ciphertext">Copy S</button>
                    <button className="btn danger" onClick={() => deleteItem(item.item_id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5">No items match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:8}}>
          <label><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)} /> Show secrets</label>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Password generator</h3>
          <div className="grid" style={{gap:'0.5rem'}}>
            <div className="form-field">
              <label htmlFor="len">Length</label>
              <input id="len" type="number" min={8} max={128} value={gen.length} onChange={e=>setGen(g=>({...g, length: Number(e.target.value)}))} />
            </div>
            <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
              <label><input type="checkbox" checked={gen.uppercase} onChange={e=>setGen(g=>({...g, uppercase: e.target.checked}))}/> Uppercase</label>
              <label><input type="checkbox" checked={gen.lowercase} onChange={e=>setGen(g=>({...g, lowercase: e.target.checked}))}/> Lowercase</label>
              <label><input type="checkbox" checked={gen.digits} onChange={e=>setGen(g=>({...g, digits: e.target.checked}))}/> Digits</label>
              <label><input type="checkbox" checked={gen.symbols} onChange={e=>setGen(g=>({...g, symbols: e.target.checked}))}/> Symbols</label>
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="btn" onClick={doGenerate}>Generate</button>
              <button className="btn muted" onClick={checkStrength} disabled={!generated}>Check strength</button>
              <button className="btn secondary" onClick={() => { if(generated) navigator.clipboard.writeText(generated); }} disabled={!generated}>Copy</button>
            </div>
            {generated && (
              <div className="alert info">
                <div><strong>Generated:</strong> <code>{generated}</code></div>
                {strength && (
                  <div style={{marginTop:6}}>
                    <strong>Score:</strong> {strength.score} / 4
                    {strength.warnings?.length ? <div>Warnings: {strength.warnings.join('; ')}</div> : null}
                    {strength.suggestions?.length ? <div>Suggestions: {strength.suggestions.join('; ')}</div> : null}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Tips</h3>
          <ul>
            <li>VaultMate stores only client-side ciphertext of your secrets.</li>
            <li>Enable MFA for stronger account protection.</li>
            <li>Use unique passwords for each site.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
