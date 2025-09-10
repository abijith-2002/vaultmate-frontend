import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Onboarding() {
  /** Accessible onboarding guide. */
  useEffect(() => { document.title = 'Onboarding • VaultMate'; }, []);
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Welcome to VaultMate</h2>
        <p>Securely store and share your passwords with strong, private-by-design encryption.</p>
        <ol>
          <li>Create an account from the Register page.</li>
          <li>Enable Multi‑Factor Authentication (MFA) in the MFA page.</li>
          <li>Add your first credential from the Vault.</li>
          <li>Share access securely when needed.</li>
        </ol>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <Link to="/register" className="btn">Create account</Link>
          <Link to="/login" className="btn secondary">I already have an account</Link>
        </div>
      </div>
      <div className="card">
        <h3>Accessibility</h3>
        <p>We follow WCAG 2.1 guidelines for keyboard navigation, contrasts, and ARIA labeling.</p>
        <ul>
          <li>Press Tab to navigate through links and controls.</li>
          <li>Contrast-friendly colors for readability.</li>
          <li>Forms with labels and inline descriptions.</li>
        </ul>
      </div>
    </div>
  );
}
