import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ApiStatusIndicator from './components/ApiStatusIndicator';

/**
 * Minimal layout that centers content. Uses palette variables.
 * Includes the top-right online/offline status indicator.
 */
function CenteredLayout({ children }) {
  return (
    <div className="center" style={{ position: 'relative' }}>
      <ApiStatusIndicator pollIntervalMs={10000} />
      <div className="container">
        <header style={{marginBottom: 18, display: 'flex', justifyContent: 'center'}}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{display:'flex', alignItems:'baseline', gap:8}}>
              <span style={{fontWeight:700, fontSize:'1.25rem', color:'var(--text)'}}>VaultMate</span>
              <span className="text-muted" style={{fontSize:'0.95rem'}}>Security</span>
            </div>
          </Link>
        </header>
        {children}
        <footer style={{marginTop: 16, textAlign:'center', color:'var(--text-muted)', fontSize:'0.9rem'}}>
          <span>Secure by design • MFA ready</span>
        </footer>
      </div>
    </div>
  );
}

function GuardToLogin({ children }) {
  const { isAuthed } = useAuth();
  if (isAuthed) return <Navigate to="/login" replace />;
  return children;
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
