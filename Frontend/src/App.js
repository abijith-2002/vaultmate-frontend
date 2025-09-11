import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ApiStatusIndicator from './components/ApiStatusIndicator';
import SupabaseConfigPanel from './components/SupabaseConfigPanel';
import VaultPage from './pages/vault/VaultPage';

/**
 * Minimal layout that centers content. Uses palette variables.
 * Includes the top-right online/offline status indicator.
 */
function CenteredLayout({ children }) {
  return (
    <div className="center layout-root">
      {/* Keep indicator visually top-right without stretching */}
      <ApiStatusIndicator pollIntervalMs={10000} />
      <div className="container">
        <header style={{ marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>VaultMate</span>
              <span className="text-muted" style={{ fontSize: '0.95rem' }}>Security</span>
            </div>
          </Link>
        </header>
        {children}
        <footer style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span>Secure by design • MFA ready</span>
        </footer>
      </div>
      <SupabaseConfigPanel />
    </div>
  );
}

function GuardToLogin({ children }) {
  const { isAuthed } = useAuth();
  // If already authenticated, do not show auth pages; send to app home
  if (isAuthed) return <Navigate to="/vault" replace />;
  return children;
}

function GuardForAuthed({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

// Minimal authenticated landing content
function AuthedHome() {
  return (
    <CenteredLayout>
      <div className="card stack">
        <div>
          <h2>Welcome to VaultMate</h2>
          <p className="subtitle">You’re signed in. Use the app to manage your vault.</p>
        </div>
        <div className="row">
          <Link to="/vault" className="btn">Open Vault</Link>
          <Link to="/settings" className="btn secondary">Settings</Link>
          <Link to="/help" className="btn muted">Help</Link>
        </div>
      </div>
    </CenteredLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuardToLogin>
            <Navigate to="/login" replace />
          </GuardToLogin>
        }
      />
      <Route
        path="/login"
        element={
          <GuardToLogin>
            <CenteredLayout>
              <div className="card stack">
                <div>
                  <h2>Sign in</h2>
                  <p className="subtitle">Welcome back. Use your email and password.</p>
                </div>
                <LoginPage />
                <div className="row">
                  <span className="text-muted">Don’t have an account?</span>
                  <Link to="/register" className="btn secondary">Create account</Link>
                </div>
              </div>
            </CenteredLayout>
          </GuardToLogin>
        }
      />
      <Route
        path="/register"
        element={
          <GuardToLogin>
            <CenteredLayout>
              <div className="card stack">
                <div>
                  <h2>Create account</h2>
                  <p className="subtitle">Start using VaultMate securely in minutes.</p>
                </div>
                <RegisterPage />
                <div className="row">
                  <span className="text-muted">Already have an account?</span>
                  <Link to="/login" className="btn secondary">Sign in</Link>
                </div>
              </div>
            </CenteredLayout>
          </GuardToLogin>
        }
      />
      {/* Authenticated routes */}
      <Route
        path="/vault"
        element={
          <GuardForAuthed>
            <CenteredLayout>
              <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
                <VaultPage />
              </div>
            </CenteredLayout>
          </GuardForAuthed>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root app: provides Auth context and routes for Login/Register. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
