import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function MFAPage() {
  /** MFA enrollment page: start setup, show secret/QR URL, verify OTP. */
  const { startMFASetup, verifyMFA, reloadProfile } = useAuth();
  const [setup, setSetup] = useState(null);
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = 'MFA • VaultMate'; }, []);

  async function begin() {
    setError(null);
    try {
      const s = await startMFASetup();
      setSetup(s);
    } catch (e) {
      setError(e.message);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError(null); setStatus(null);
    try {
      await verifyMFA(otp);
      setStatus('MFA enabled successfully.');
      setOtp('');
      setSetup(null);
      await reloadProfile();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Multi‑Factor Authentication</h2>
        <p className="text-muted">Add an extra layer of protection to your account.</p>
        {error && <div className="alert error" role="alert">{error}</div>}
        {status && <div className="alert success" role="status">{status}</div>}

        {!setup && (
          <button className="btn secondary" onClick={begin}>Begin Setup</button>
        )}

        {setup && (
          <div className="grid" style={{gap:'0.75rem'}}>
            <div className="alert info">
              Secret: <code>{setup.secret}</code>
            </div>
            <div>
              <a href={setup.otpauth_url} className="btn" rel="noreferrer" target="_blank">Open in Authenticator</a>
            </div>
            <form onSubmit={verify} className="grid" style={{gap:'0.75rem'}}>
              <div className="form-field">
                <label htmlFor="otp">Enter OTP to verify</label>
                <input id="otp" inputMode="numeric" pattern="[0-9]*" required value={otp} onChange={e=>setOtp(e.target.value)} />
              </div>
              <button className="btn success" type="submit">Verify & Enable</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
