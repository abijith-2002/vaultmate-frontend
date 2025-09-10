import React, { useEffect } from 'react';

// PUBLIC_INTERFACE
export default function Help() {
  /** Help and FAQs page. */
  useEffect(() => { document.title = 'Help • VaultMate'; }, []);
  return (
    <div className="card">
      <h2>Help & FAQs</h2>
      <details>
        <summary>How does VaultMate protect my data?</summary>
        <p>Only client-side ciphertext of secrets is stored. Your keys never leave your device.</p>
      </details>
      <details>
        <summary>How can I enable MFA?</summary>
        <p>Go to the MFA page and follow the guided setup with your authenticator app.</p>
      </details>
      <details>
        <summary>How do I share an item?</summary>
        <p>Open the Sharing page, select an item, and enter the recipient's email.</p>
      </details>
    </div>
  );
}
