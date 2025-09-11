import React, { useEffect, useState } from 'react';
import { getApiBase, setApiBase } from '../api/client';

/**
 * Small badge indicating backend online/offline and opening a config modal to edit API base.
 * - Polls /health (falls back to /) every pollIntervalMs.
 * - Uses app palette and Figtree font.
 */
export default function ApiStatusIndicator({ pollIntervalMs = 10000 }) {
  const [online, setOnline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tempBase, setTempBase] = useState(getApiBase() || '');

  // Health check function
  async function ping() {
    const base = getApiBase();
    if (!base) { setOnline(false); return; }
    setChecking(true);
    // Try /health first, then root /
    const tryEndpoints = ['/health', '/'];
    for (const path of tryEndpoints) {
      try {
        const url = (base.replace(/\/+$/, '')) + path;
        const res = await fetch(url, { method: 'GET' });
        if (res.ok) {
          setOnline(true);
          setChecking(false);
          return;
        }
      } catch {
        // continue
      }
    }
    setOnline(false);
    setChecking(false);
  }

  useEffect(() => {
    // First ping immediately on mount
    ping();
    const id = setInterval(ping, pollIntervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollIntervalMs]);

  function onOpen() {
    setTempBase(getApiBase() || '');
    setShowModal(true);
  }

  function onSave(e) {
    e?.preventDefault?.();
    setApiBase(tempBase);
    setShowModal(false);
    // Re-run health check after saving
    ping();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') setShowModal(false);
  }

  const badgeColor = online ? 'var(--accent)' : '#c9444a'; // greenish accent vs error red
  const badgeText = online ? 'Online' : 'Offline';

  return (
    <>
      <button
        onClick={onOpen}
        aria-label={`Backend status: ${badgeText}. Click to configure API base URL.`}
        title={`Backend status: ${badgeText}`}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 999,
          border: `1px solid ${online ? 'rgba(138,162,158,0.45)' : 'rgba(255,80,80,0.35)'}`,
          background: 'var(--muted-surface)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontFamily: 'Figtree, system-ui, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Arial, sans-serif',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: checking ? 'linear-gradient(90deg, var(--accent), var(--primary))' : badgeColor,
            display: 'inline-block',
            boxShadow: online ? '0 0 0 3px rgba(138,162,158,0.25)' : '0 0 0 3px rgba(201,68,74,0.2)',
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 12 }}>{badgeText}</span>
      </button>

      {showModal && (
        <div
          onKeyDown={onKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-config-title"
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            // close when clicking backdrop
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <form
            onSubmit={onSave}
            className="stack"
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'linear-gradient(0deg, var(--surface), var(--surface))',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              color: 'var(--text)',
              boxShadow: '0 10px 32px rgba(0,0,0,0.35)',
              fontFamily: 'Figtree, system-ui, -apple-system, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Arial, sans-serif',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <h3 id="api-config-title" style={{ margin: 0 }}>Backend configuration</h3>
                <p className="text-muted" style={{ margin: '6px 0 0' }}>
                  Set the API base URL used by this app. Stored in localStorage as vm_api_base.
                </p>
              </div>
              <button
                type="button"
                className="btn muted"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                style={{ width: 36, height: 36, padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div className="form-field" style={{ marginTop: 10 }}>
              <label htmlFor="api-base">API base URL</label>
              <input
                id="api-base"
                placeholder="https://api.example.com"
                value={tempBase}
                onChange={(e) => setTempBase(e.target.value)}
                autoFocus
              />
              <small className="text-muted">
                Example: https://localhost:8000 (no trailing slash required)
              </small>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn" type="submit">Save</button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  const envBase = process.env.REACT_APP_API_BASE || '';
                  setTempBase(envBase);
                }}
              >
                Use env default
              </button>
              <button
                type="button"
                className="btn muted"
                onClick={() => {
                  setTempBase('');
                }}
              >
                Clear
              </button>
            </div>

            <div className="alert info" style={{ marginTop: 8 }}>
              Current status: {online ? 'Online' : 'Offline'} • Base: <code>{getApiBase() || '(not set)'}</code>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
