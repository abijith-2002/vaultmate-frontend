import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Settings() {
  /** User settings overview. */
  const { user } = useAuth();
  useEffect(() => { document.title = 'Settings • VaultMate'; }, []);
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Account</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Full name:</strong> {user?.full_name || '-'}</p>
        <p><strong>Roles:</strong> {(user?.roles || []).join(', ') || 'user'}</p>
      </div>
      <div className="card">
        <h2>Security</h2>
        <p><strong>MFA:</strong> {user?.mfa_enabled ? 'Enabled' : 'Disabled'}</p>
        <Link to="/mfa" className="btn">{user?.mfa_enabled ? 'Manage MFA' : 'Enable MFA'}</Link>
      </div>
    </div>
  );
}
