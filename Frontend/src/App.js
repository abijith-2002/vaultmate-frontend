import React from 'react';
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

function AppShell() {
  const { isAuthed, user, logout } = useAuth();

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
