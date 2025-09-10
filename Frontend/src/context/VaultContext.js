import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api/client';

const VaultContext = createContext(null);

// PUBLIC_INTERFACE
export function useVault() {
  /** Access vault items and actions. */
  return useContext(VaultContext);
}

// PUBLIC_INTERFACE
export function VaultProvider({ children }) {
  /** Provides vault items listing and CRUD actions. */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState(null);

  async function refresh() {
    setLoading(true); setLastError(null);
    try {
      const list = await apiGet('/vault/items', true);
      setItems(list);
    } catch (e) {
      setLastError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function createItem(payload) {
    const created = await apiPost('/vault/items', payload, true);
    setItems(prev => [created, ...prev]);
    return created;
  }

  async function updateItem(id, payload) {
    const updated = await apiPatch(`/vault/items/${id}`, payload, true);
    setItems(prev => prev.map(i => i.item_id === id ? updated : i));
    return updated;
  }

  async function deleteItem(id) {
    await apiDelete(`/vault/items/${id}`, true);
    setItems(prev => prev.filter(i => i.item_id !== id));
  }

  const value = { items, loading, lastError, refresh, createItem, updateItem, deleteItem };
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}
