import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VaultsProvider, useVaults } from '../../context/VaultsContext';
import { maskSecret } from '../../utils/password';

/**
 * VaultPage renders a two-pane layout:
 * - Left: vertical list of user's vaults
 * - Right: items within the selected vault
 * Uses VaultsProvider to fetch from backend when available or fallback to mock data.
 */

function VaultsLayout() {
  const { vaults, selectedVaultId, selectVault, items, loading, error, reloadVaults, reloadItems } = useVaults();
  const [query, setQuery] = useState('');

  useEffect(() => { document.title = 'Vault • VaultMate'; }, []);

  const selectedVault = useMemo(() => vaults.find(v => v.id === selectedVaultId) || null, [vaults, selectedVaultId]);
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.username || '').toLowerCase().includes(q) ||
      (i.url || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="vault-two-pane">
      {/* Left pane: vault list */}
      <aside className="vaults-pane" aria-label="Vaults">
        <div className="pane-header">
          <h3 style={{ margin: 0 }}>Your Vaults</h3>
          <button className="btn muted" onClick={reloadVaults} aria-busy={loading} title="Reload vaults">↻</button>
        </div>
        {error && <div className="alert error" style={{ marginTop: 8 }}>{error}</div>}
        <ul className="vaults-list" role="listbox" aria-label="Select a vault">
          {vaults.map(v => (
            <li key={v.id}>
              <button
                className={`vaults-list-item ${selectedVaultId === v.id ? 'active' : ''}`}
                aria-selected={selectedVaultId === v.id}
                onClick={() => selectVault(v.id)}
              >
                <div className="vault-name">{v.name}</div>
                {v.description ? <div className="vault-desc">{v.description}</div> : null}
              </button>
            </li>
          ))}
          {vaults.length === 0 && <li className="text-muted" style={{ padding: 10 }}>No vaults found.</li>}
        </ul>
      </aside>

      {/* Right pane: items within selected vault */}
      <main className="items-pane" aria-label="Vault items">
        <div className="pane-header">
          <div>
            <h2 style={{ margin: 0 }}>{selectedVault?.name || 'Select a vault'}</h2>
            {selectedVault?.description && <div className="text-muted" style={{ marginTop: 2 }}>{selectedVault.description}</div>}
          </div>
          <div className="pane-actions">
            <Link to="/vault/new" className="btn">+ Add Item</Link>
            <button className="btn muted" onClick={reloadItems} aria-busy={loading} title="Reload items">Refresh</button>
          </div>
        </div>

        <div className="form-field" style={{ marginTop: 10 }}>
          <label htmlFor="search">Search items</label>
          <input id="search" placeholder="Title, username, or URL" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="table" role="table" aria-label="Items">
            <thead>
              <tr>
                <th>Title</th>
                <th>Username</th>
                <th>URL</th>
                <th>Secret</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.item_id}>
                  <td>{item.title}</td>
                  <td>{item.username}</td>
                  <td>{item.url || '-'}</td>
                  <td><code>{maskSecret(false, item.secret_ciphertext?.slice?.(0, 12) || '')}</code></td>
                  <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.notes || '-'}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan="5">No items to show.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function VaultPage() {
  /** Wraps the two-pane VaultsLayout with VaultsProvider. */
  return (
    <VaultsProvider>
      <VaultsLayout />
    </VaultsProvider>
  );
}
