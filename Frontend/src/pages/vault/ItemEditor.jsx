import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet } from '../../api/client';
import { useVault } from '../../context/VaultContext';

// PUBLIC_INTERFACE
export default function ItemEditor() {
  /** Create or edit a single vault item. */
  const { itemId } = useParams();
  const isNew = !itemId || itemId === 'new';
  const { createItem, updateItem } = useVault();
  const [form, setForm] = useState({ title: '', username: '', url: '', notes: '', secret_ciphertext: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { document.title = (isNew ? 'New' : 'Edit') + ' Item • VaultMate'; }, [isNew]);

  useEffect(() => {
    async function load() {
      if (isNew) return;
      try {
        const item = await apiGet(`/vault/items/${itemId}`, true);
        setForm({
          title: item.title,
          username: item.username,
          url: item.url || '',
          notes: item.notes || '',
          secret_ciphertext: item.secret_ciphertext
        });
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [isNew, itemId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (isNew) {
        await createItem(form);
      } else {
        await updateItem(itemId, form);
      }
      navigate('/vault');
    } catch (e) {
      setError(e.message);
    }
  }

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  return (
    <div className="card">
      <h2>{isNew ? 'Add new' : 'Edit'} vault item</h2>
      {error && <div className="alert error" role="alert">{error}</div>}
      <form onSubmit={onSubmit} className="grid" style={{gap:'0.75rem'}}>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={e=>setField('title', e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input id="username" value={form.username} onChange={e=>setField('username', e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="url">URL</label>
          <input id="url" value={form.url} onChange={e=>setField('url', e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows="3" value={form.notes} onChange={e=>setField('notes', e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="secret">Secret (client-side ciphertext)</label>
          <input id="secret" value={form.secret_ciphertext} onChange={e=>setField('secret_ciphertext', e.target.value)} required />
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn" type="submit">{isNew ? 'Create' : 'Save changes'}</button>
          <button className="btn muted" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
