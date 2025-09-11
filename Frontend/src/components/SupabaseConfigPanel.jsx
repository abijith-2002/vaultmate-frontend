import React, { useEffect, useState } from 'react';
import { getSupabaseConfig, reconfigureSupabase } from '../api/supabase';

/**
 * Tiny inline panel to inspect and adjust Supabase config at runtime.
 * Uses localStorage keys:
 * - vm_supabase_url
 * - vm_supabase_key
 *
 * Helpful for resolving "Invalid API key" without rebuilding the app.
 */
// PUBLIC_INTERFACE
export default function SupabaseConfigPanel() {
  /** Minimal UI for viewing and updating Supabase URL and anon key. */
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState(null);
  const [issues, setIssues] = useState({ urlLikelyValid: false, keyLikelyValid: false });

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setUrl(cfg.url || '');
    setKey(''); // avoid leaking key in UI; require re-entry to change
    setIssues(cfg.issues || { urlLikelyValid: false, keyLikelyValid: false });
  }, [visible]);

  async function apply(e) {
    e?.preventDefault?.();
    setStatus(null);
    try {
      const newUrl = url?.trim();
      const newKey = key?.trim();
      if (newUrl) localStorage.setItem('vm_supabase_url', newUrl); else localStorage.removeItem('vm_supabase_url');
      if (newKey) localStorage.setItem('vm_supabase_key', newKey); // allow empty to keep existing
      // Recreate client to use new values immediately
      await reconfigureSupabase(
        newUrl || (getSupabaseConfig().url || ''),
        newKey || (localStorage.getItem('vm_supabase_key') || '')
      );
      setStatus('Saved. Supabase client reconfigured.');
      setIssues(getSupabaseConfig().issues || { urlLikelyValid: false, keyLikelyValid: false });
    } catch (err) {
      setStatus(`Error: ${err?.message || 'Failed to apply config'}`);
    }
  }

  return (
    <div style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 1000 }}>
      <button
        type="button"
        className="btn secondary"
        onClick={() => setVisible(v => !v)}
        title="Configure Supabase"
        style={{ padding: '8px 10px' }}
      >
        Supabase {visible ? '▲' : '▼'}
      </button>

      {visible && (
        <form
          onSubmit={apply}
          className="stack"
          style={{
            marginTop: 8,
            width: 320,
            background: 'var(--muted-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
          }}
        >
          <strong>Supabase config</strong>
          <div className="alert info">
            URL valid: {String(issues.urlLikelyValid)} • Key valid: {String(issues.keyLikelyValid)}
          </div>
          <div className="form-field">
            <label htmlFor="sb-url">Project URL</label>
            <input
              id="sb-url"
              placeholder="https://YOUR-PROJECT.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="sb-key">Anon public key</label>
            <input
              id="sb-key"
              type="password"
              placeholder="Paste anon public key (starts with ey...)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">Apply</button>
            <button
              className="btn muted"
              type="button"
              onClick={() => {
                localStorage.removeItem('vm_supabase_url');
                localStorage.removeItem('vm_supabase_key');
                setStatus('Cleared runtime overrides. Reload to use env values.');
              }}
            >
              Clear overrides
            </button>
          </div>
          {status && <div className="alert">{status}</div>}
          <small className="text-muted">
            Use your Project → Settings → API → Project URL and anon public key. Do not use service_role.
          </small>
        </form>
      )}
    </div>
  );
}
