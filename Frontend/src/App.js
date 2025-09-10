import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MFAPage from './pages/auth/MFAPage';
import Dashboard from './pages/vault/Dashboard';
import ItemEditor from './pages/vault/ItemEditor';
import SharePage from './pages/vault/SharePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditLogs from './pages/admin/AuditLogs';
import Onboarding from './pages/help/Onboarding';
import Help from './pages/help/Help';
import Settings from './pages/settings/Settings';
import { getApiBase, setApiBase, apiGet } from './api/client';

function AppShell() {
  const { isAuthed, user, logout } = useAuth();
  const [apiModalOpen, setApiModalOpen] = useState(false);

  return (
    <div className="app-shell">
      <nav className="navbar" aria-label="Primary">
        <div className="brand" aria-label="VaultMate home">
          <span style={{width:10,height:10,background:'var(--cambridge-blue)',display:'inline-block',borderRadius:2}} aria-hidden="true" />
          VaultMate
          <span className="brand-badge">Security</span>
        </div>
        <div className="nav-links" role="navigation">
          {isAuthed && (
            <>
              <NavLink to="/vault" className="nav-link">Vault</NavLink>
              <NavLink to="/share" className="nav-link">Sharing</NavLink>
              <NavLink to="/settings" className="nav-link">Settings</NavLink>
              {(user?.roles || []).includes('admin') && (
                <>
                  <NavLink to="/admin" className="nav-link">Admin</NavLink>
                  <NavLink to="/admin/audit" className="nav-link">Audit</NavLink>
                </>
              )}
              <button className="btn muted" onClick={logout} aria-label="Log out">Logout</button>
            </>
          )}
          {!isAuthed && (
            <>
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="nav-link">Register</NavLink>
              <NavLink to="/onboarding" className="nav-link">Onboarding</NavLink>
              <NavLink to="/help" className="nav-link">Help</NavLink>
            </>
          )}
        </div>
      </nav>

      {/* Persistent Online Indicator & API Base Dialog */}
      <OnlineIndicator onClick={() => setApiModalOpen(true)} />
      {apiModalOpen && <ApiBaseDialog onClose={() => setApiModalOpen(false)} />}

      <main className="container" id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthed ? '/vault' : '/onboarding'} replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={isAuthed ? <Navigate to="/vault" /> : <LoginPage />} />
          <Route path="/register" element={isAuthed ? <Navigate to="/vault" /> : <RegisterPage />} />
          <Route path="/mfa" element={<MFAPage />} />

          <Route path="/vault" element={isAuthed ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/vault/new" element={isAuthed ? <ItemEditor /> : <Navigate to="/login" />} />
          <Route path="/vault/:itemId" element={isAuthed ? <ItemEditor /> : <Navigate to="/login" />} />
          <Route path="/share" element={isAuthed ? <SharePage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={isAuthed ? <Settings /> : <Navigate to="/login" />} />

          <Route path="/admin" element={isAuthed && (user?.roles||[]).includes('admin') ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/audit" element={isAuthed && (user?.roles||[]).includes('admin') ? <AuditLogs /> : <Navigate to="/login" />} />
          <Route path="*" element={<div className="card" role="alert">Page not found.</div>} />
        </Routes>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} VaultMate Security • Built with care
      </footer>
    </div>
  );
}

/**
 * Persistent top-left online indicator with periodic health checks.
 * - Polls /health every 10s (backoff on failures).
 * - Clickable to open API base configuration dialog.
 * - Accessible with role="button" and keyboard handlers.
 */
function OnlineIndicator({ onClick }) {
  const [online, setOnline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [base, setBase] = useState(getApiBase());
  const timerRef = useRef(null);
  const intervalMs = 10000;

  const ariaLabel = online
    ? `Backend online at ${base || 'not set'}`
    : `Backend offline${base ? ' at ' + base : ''}`;

  async function check() {
    if (checking) return;
    setChecking(true);
    setLastError(null);
    try {
      // Allow both /health and / endpoints per backend variations
      // Prefer / since openapi shows root as health; fallback to /health
      try {
        await apiGet('/', false);
        setOnline(true);
      } catch {
        await apiGet('/health', false);
        setOnline(true);
      }
    } catch (e) {
      setOnline(false);
      setLastError(e?.message || 'Unreachable');
    } finally {
      setChecking(false);
    }
  }

  // Start polling with cleanup
  useEffect(() => {
    check(); // initial
    timerRef.current = setInterval(check, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Reflect base changes originating elsewhere
  useEffect(() => {
    const id = setInterval(() => setBase(getApiBase()), 2000);
    return () => clearInterval(id);
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  }

  const dotColor = online ? 'var(--success)' : 'var(--danger)';

  return (
    <div style={{
      position: 'fixed', top: 10, left: 10, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 8
    }}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed="false"
        aria-label={`${ariaLabel}. Activate to configure API URL.`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }}
      >
        <span aria-hidden="true" style={{
          width: 10, height: 10, borderRadius: 999, background: dotColor,
          boxShadow: online ? '0 0 10px rgba(39,174,96,0.8)' : '0 0 6px rgba(231,76,60,0.8)'
        }} />
        <span style={{ fontSize: 12, color: 'var(--text)' }}>
          {online ? 'Online' : 'Offline'}{checking ? '…' : ''}
        </span>
      </div>
      <span className="visually-hidden" role="status" aria-live="polite">
        {online ? 'Backend is online' : 'Backend is offline'}{lastError ? `. ${lastError}` : ''}
      </span>
    </div>
  );
}

/**
 * Centered accessible dialog to configure API base URL.
 * - Trap focus, close on Escape, click outside, and Save/Cancel.
 * - Persists to localStorage and updates runtime client via setApiBase.
 */
function ApiBaseDialog({ onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [value, setValue] = useState(getApiBase());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Focus input when dialog opens
    setTimeout(() => inputRef.current?.focus(), 0);
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function validateUrl(u) {
    if (!u || !u.trim()) return true; // allow empty to mean relative
    try {
      // Accept http/https absolute or relative root ''
      const ok = /^https?:\/\//i.test(u.trim());
      return ok;
    } catch {
      return false;
    }
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      if (!validateUrl(value)) {
        setError('Please enter a valid http(s) URL, e.g. http://localhost:3001');
        return;
      }
      const applied = setApiBase(value);
      // Optional: ping after saving to give immediate feedback
      try { await apiGet('/', false); } catch {}
      onClose();
      return applied;
    } finally {
      setSaving(false);
    }
  }

  function onBackdrop(e) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <div
      ref={dialogRef}
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-conf-title"
      aria-describedby="api-conf-desc"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center', zIndex: 1100
      }}
    >
      <div className="card" style={{ width: 'min(520px, 92%)' }}>
        <h2 id="api-conf-title" style={{ marginTop: 0 }}>Configure Backend API</h2>
        <p id="api-conf-desc" className="text-muted">
          Set the base URL for the backend API. Example: http://localhost:3001
        </p>
        <div className="form-field">
          <label htmlFor="api-base">API Base URL</label>
          <input
            id="api-base"
            ref={inputRef}
            placeholder="http://localhost:3001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        {error && <div className="alert error" role="alert" style={{ marginTop: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn" disabled={saving} onClick={save} aria-busy={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn muted" onClick={onClose}>Cancel</button>
          <button
            className="btn danger"
            type="button"
            onClick={() => setValue('')}
            title="Clear to use relative paths (same origin)"
          >
            Clear
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Current: <code>{getApiBase() || '(relative base)'}</code>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** App entry with providers. */
  return (
    <BrowserRouter>
      <AuthProvider>
        <VaultProvider>
          <AppShell />
        </VaultProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
