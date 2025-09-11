import React, { useEffect, useMemo, useState } from 'react';
import { VaultsProvider, useVaults } from '../../context/VaultsContext';
import { apiDelete, apiPatch, apiPost } from '../../api/client';
import { maskSecret } from '../../utils/password';

/**
 * UI Helpers: small icon components (inline SVG) to avoid extra dependencies.
 */
function IconPlus(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"/>
    </svg>
  );
}
function IconRefresh(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M17.65 6.35a7.95 7.95 0 0 0-11.3 0l-1.1-1.1V10h4.75l-1.75-1.75a5.98 5.98 0 0 1 8.5 0 6 6 0 1 1-8.48 8.48l-1.42 1.42A8 8 0 1 0 19 8c0-.7-.09-1.38-.26-2.03l-1.09.38Z"/>
    </svg>
  );
}
function IconEdit(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm15.71-9.04a1 1 0 0 0 0-1.41l-2.5-2.5a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.99-1.67z"/>
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M6 7h12v14H6z" opacity=".3"/><path fill="currentColor" d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM7 7h10v12H7z"/>
    </svg>
  );
}
function IconEye(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 .002 6.002A3 3 0 0 0 12 9Z"/>
    </svg>
  );
}
function IconCopy(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v16h13c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 18H8V7h11v16z"/>
    </svg>
  );
}

/**
 * Simple, accessible modal component.
 */
function Modal({ title, onClose, children, actions, labelledById = 'modal-title' }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
        background: 'rgba(0,0,0,0.45)', zIndex: 1000, padding: 16
      }}
    >
      <div
        className="card stack"
        style={{ width: '100%', maxWidth: 560, padding: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 id={labelledById} style={{ margin: 0 }}>{title}</h3>}
        {children}
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Item form used for Add/Edit modal.
 */
function ItemForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    username: initial?.username || '',
    url: initial?.url || '',
    notes: initial?.notes || '',
    secret_ciphertext: initial?.secret_ciphertext || '',
  }));
  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    onSave?.(form);
  }

  return (
    <form onSubmit={submit} className="stack" style={{ marginTop: 4 }}>
      <div className="form-field">
        <label htmlFor="it-title">Title</label>
        <input id="it-title" value={form.title} onChange={e => setField('title', e.target.value)} required autoFocus />
      </div>
      <div className="form-field">
        <label htmlFor="it-user">Username</label>
        <input id="it-user" value={form.username} onChange={e => setField('username', e.target.value)} required />
      </div>
      <div className="form-field">
        <label htmlFor="it-url">URL</label>
        <input id="it-url" value={form.url} onChange={e => setField('url', e.target.value)} placeholder="https://example.com" />
      </div>
      <div className="form-field">
        <label htmlFor="it-notes">Notes</label>
        <textarea id="it-notes" rows="3" value={form.notes} onChange={e => setField('notes', e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="it-secret">Secret (client-side ciphertext)</label>
        <input id="it-secret" value={form.secret_ciphertext} onChange={e => setField('secret_ciphertext', e.target.value)} required />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn" type="submit" disabled={saving} aria-busy={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn muted" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * Main two-pane layout: left vaults, right items for selected vault.
 * Reuses VaultsContext for data fetching; adds enhanced UI and inline item CRUD.
 */
function VaultsLayout() {
  const { vaults, selectedVaultId, selectVault, items, loading, error, reloadVaults, reloadItems } = useVaults();

  const [query, setQuery] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);

  // Optimistic local overlay for item list while performing UI actions
  const [draftItems, setDraftItems] = useState(null);
  const [toast, setToast] = useState(null);

  // Add/Edit modal state
  const [editing, setEditing] = useState(null); // null (closed) | { item } | { } for new
  const [saving, setSaving] = useState(false);

  // Add Vault placeholder modal
  const [showAddVault, setShowAddVault] = useState(false);

  useEffect(() => { document.title = 'Vault • VaultMate'; }, []);

  useEffect(() => {
    // Reset any local draft overlay when vault selection changes
    setDraftItems(null);
    setQuery('');
  }, [selectedVaultId]);

  const selectedVault = useMemo(() => vaults.find(v => v.id === selectedVaultId) || null, [vaults, selectedVaultId]);
  const visibleItems = useMemo(() => draftItems ?? items, [draftItems, items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleItems.filter(i =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.username || '').toLowerCase().includes(q) ||
      (i.url || '').toLowerCase().includes(q)
    );
  }, [visibleItems, query]);

  function openAdd() {
    setEditing({}); // new
  }
  function openEdit(item) {
    setEditing(item);
  }
  function closeEditor() {
    setEditing(null);
    setSaving(false);
  }

  async function saveItem(form) {
    setSaving(true);
    const isNew = !editing?.item_id;
    try {
      let saved = null;
      if (isNew) {
        // Attempt API create; fallback to local mock item_id if fails
        try {
          saved = await apiPost('/vault/items', { ...form }, true);
        } catch {
          const mockId = `local-${Math.random().toString(36).slice(2, 9)}`;
          saved = { ...form, item_id: mockId };
          setToast('Backend create failed; added item locally for this session.');
        }
        setDraftItems(prev => {
          const base = prev ?? items;
          return [saved, ...base];
        });
      } else {
        // Attempt API update
        try {
          saved = await apiPatch(`/vault/items/${editing.item_id}`, { ...form }, true);
        } catch {
          saved = { ...form, item_id: editing.item_id };
          setToast('Backend update failed; changes applied locally for this session.');
        }
        setDraftItems(prev => {
          const base = prev ?? items;
          return base.map(i => (i.item_id === saved.item_id ? saved : i));
        });
      }
      closeEditor();
      // Best-effort sync with backend
      try { await reloadItems(); setDraftItems(null); } catch { /* ignore */ }
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    // Optimistic remove
    setDraftItems(prev => {
      const base = prev ?? items;
      return base.filter(i => i.item_id !== item.item_id);
    });
    try {
      await apiDelete(`/vault/items/${item.item_id}`, true);
    } catch {
      setToast('Backend delete failed; removal shown locally only for this session.');
    }
    try { await reloadItems(); setDraftItems(null); } catch { /* ignore */ }
  }

  function copyToClipboard(text, label = 'Copied') {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setToast(label);
      // auto clear
      setTimeout(() => setToast(null), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="vault-two-pane" aria-busy={loading}>
      {/* Left: Vaults list */}
      <aside className="vaults-pane" aria-label="Vaults">
        <div className="pane-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ margin: 0, lineHeight: 1.2 }}>Your Vaults</h3>
            {selectedVault && (
              <span className="badge" aria-label="Items in selected vault">
                {visibleItems.length} items
              </span>
            )}
          </div>
          <div className="pane-actions">
            <button className="icon-btn" title="Add vault" aria-label="Add vault" onClick={() => setShowAddVault(true)}>
              <IconPlus />
            </button>
            <button className="icon-btn" title="Reload vaults" aria-label="Reload vaults" onClick={reloadVaults}>
              <IconRefresh />
            </button>
          </div>
        </div>
        {error && <div className="alert error" style={{ marginTop: 8 }}>{error}</div>}
        <ul className="vaults-list" role="listbox" aria-label="Select a vault">
          {vaults.map(v => (
            <li key={v.id}>
              <button
                className={`vaults-list-item ${selectedVaultId === v.id ? 'active' : ''}`}
                role="option"
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

      {/* Right: Items of selected vault */}
      <main className="items-pane" aria-label="Vault items">
        <div className="pane-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, lineHeight: 1.2 }}>
              {selectedVault?.name || 'Select a vault'}
            </h2>
            {selectedVault?.description && (
              <div className="text-muted" style={{ marginTop: 4 }}>{selectedVault.description}</div>
            )}
          </div>
          <div className="pane-actions">
            <button className="btn" onClick={openAdd}><IconPlus /> Add Item</button>
            <button className="btn secondary" onClick={reloadItems} aria-busy={loading}><IconRefresh /> Refresh</button>
          </div>
        </div>

        <div className="toolbar">
          <div className="form-field" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="vm-search">Search items</label>
            <input
              id="vm-search"
              placeholder="Title, username, or URL"
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={!selectedVault}
            />
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <input type="checkbox" checked={showSecrets} onChange={e => setShowSecrets(e.target.checked)} />
            Show secrets
          </label>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="table" role="table" aria-label="Items">
            <thead>
              <tr>
                <th>Title</th>
                <th>Username</th>
                <th>URL</th>
                <th>Secret</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.item_id}>
                  <td>{item.title || '-'}</td>
                  <td>
                    {item.username || '-'}
                    {item.username ? (
                      <button
                        className="icon-btn small"
                        title="Copy username"
                        aria-label="Copy username"
                        onClick={() => copyToClipboard(item.username, 'Username copied')}
                        style={{ marginLeft: 6 }}
                      >
                        <IconCopy />
                      </button>
                    ) : null}
                  </td>
                  <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.url || '-'}
                  </td>
                  <td>
                    <code>
                      {showSecrets
                        ? (item.secret_ciphertext?.slice?.(0, 24) || '')
                        : maskSecret(false, item.secret_ciphertext?.slice?.(0, 24) || '')
                      }
                    </code>
                    {item.secret_ciphertext ? (
                      <button
                        className="icon-btn small"
                        title="Copy secret ciphertext"
                        aria-label="Copy secret ciphertext"
                        onClick={() => copyToClipboard(item.secret_ciphertext, 'Secret copied')}
                        style={{ marginLeft: 6 }}
                      >
                        <IconCopy />
                      </button>
                    ) : null}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button className="btn secondary" onClick={() => openEdit(item)} aria-label={`Edit ${item.title || 'item'}`}>
                        <IconEdit /> Edit
                      </button>
                      <button className="btn danger" onClick={() => deleteItem(item)} aria-label={`Delete ${item.title || 'item'}`}>
                        <IconTrash /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <IconEye />
                      <div style={{ fontWeight: 600 }}>No items to show</div>
                      <div className="text-muted">Try a different search or add a new item.</div>
                      <div>
                        <button className="btn" onClick={openAdd}><IconPlus /> Add your first item</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {toast && (
          <div className="alert info" style={{ marginTop: 10 }} role="status">{toast}</div>
        )}
      </main>

      {/* Add/Edit Item Modal */}
      {editing !== null && (
        <Modal
          title={editing?.item_id ? 'Edit item' : 'Add new item'}
          onClose={closeEditor}
          labelledById="edit-item-title"
        >
          <ItemForm
            initial={editing}
            onCancel={closeEditor}
            onSave={saveItem}
            saving={saving}
          />
        </Modal>
      )}

      {/* Add Vault placeholder - not implemented, UI only */}
      {showAddVault && (
        <Modal title="Create a vault" onClose={() => setShowAddVault(false)}>
          <div className="alert info">
            This demo focuses on the items UI. Vault creation is not implemented in this build.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setShowAddVault(false)}>OK</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function VaultPage() {
  /** Main /vault page: dual-pane layout with vault sidebar and item management pane. */
  return (
    <VaultsProvider>
      <VaultsLayout />
    </VaultsProvider>
  );
}
