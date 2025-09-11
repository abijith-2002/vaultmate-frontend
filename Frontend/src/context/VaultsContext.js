import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { apiGet } from '../api/client';

/**
 * VaultsContext manages a list of user vaults and the items for the selected vault.
 * It tries to fetch from backend endpoints if present; falls back to mock data when unavailable.
 */

const VaultsContext = createContext(null);

// PUBLIC_INTERFACE
export function useVaults() {
  /** Access vaults, selected vault, items, and related actions. */
  return useContext(VaultsContext);
}

// Simple in-memory mock data when backend endpoints are not available.
function getMockVaults() {
  return [
    { id: 'vlt-001', name: 'Personal', description: 'My personal passwords' },
    { id: 'vlt-002', name: 'Work', description: 'Work accounts and tools' },
    { id: 'vlt-003', name: 'Shared', description: 'Family & shared accounts' },
  ];
}
function getMockItems(vaultId) {
  const base = [
    { item_id: 'it-1', title: 'Gmail', username: 'me@example.com', url: 'https://mail.google.com', secret_ciphertext: 'ciphertext-abc123', notes: '' },
    { item_id: 'it-2', title: 'Github', username: 'octocat', url: 'https://github.com', secret_ciphertext: 'ciphertext-def456', notes: '' },
    { item_id: 'it-3', title: 'Bank', username: 'me', url: 'https://bank.example.com', secret_ciphertext: 'ciphertext-ghi789', notes: '' },
  ];
  // Slight variation per vault so lists differ visually
  if (vaultId === 'vlt-002') return base.slice(0, 2);
  if (vaultId === 'vlt-003') return base.slice(1);
  return base;
}

// PUBLIC_INTERFACE
export function VaultsProvider({ children }) {
  /**
   * Provides:
   * - vaults: array of vaults
   * - selectedVaultId: string|null
   * - selectVault(id): set selected
   * - items: array of items for selected vault
   * - loading: boolean for overall loads
   * - error: string|null for load errors
   *
   * Backend probing (best effort):
   * - GET /vaults -> list of {id,name,description}
   * - GET /vaults/{id}/items -> list of items for a vault
   * If endpoints are missing/unavailable, uses mock data.
   */
  const [vaults, setVaults] = useState([]);
  const [selectedVaultId, setSelectedVaultId] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingVaults, setLoadingVaults] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState(null);
  const loading = loadingVaults || loadingItems;

  const loadVaults = useCallback(async () => {
    setLoadingVaults(true);
    setError(null);
    try {
      // Try backend first
      const list = await apiGet('/vaults', true);
      if (Array.isArray(list) && list.length) {
        setVaults(list);
        if (!selectedVaultId) setSelectedVaultId(list[0]?.id || null);
      } else {
        // If backend returns empty or unexpected, use mock as fallback.
        const mocks = getMockVaults();
        setVaults(mocks);
        if (!selectedVaultId) setSelectedVaultId(mocks[0]?.id || null);
      }
    } catch (e) {
      // Fallback to mock data
      const mocks = getMockVaults();
      setVaults(mocks);
      if (!selectedVaultId) setSelectedVaultId(mocks[0]?.id || null);
      // Keep error informative but non-blocking
      setError(e?.message || 'Failed to load vaults, showing sample vaults.');
    } finally {
      setLoadingVaults(false);
    }
  }, [selectedVaultId]);

  const loadItems = useCallback(async (vaultId) => {
    if (!vaultId) return;
    setLoadingItems(true);
    setError(null);
    try {
      const list = await apiGet(`/vaults/${vaultId}/items`, true);
      if (Array.isArray(list)) {
        setItems(list);
      } else {
        setItems(getMockItems(vaultId));
      }
    } catch (e) {
      setItems(getMockItems(vaultId));
      setError(e?.message || 'Failed to load items, showing sample items.');
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadVaults(); }, [loadVaults]);

  // Load items on selection change
  useEffect(() => { if (selectedVaultId) loadItems(selectedVaultId); }, [selectedVaultId, loadItems]);

  // PUBLIC_INTERFACE
  function selectVault(id) {
    /** Select a vault by id and refresh its items. */
    setSelectedVaultId(id);
  }

  const value = useMemo(() => ({
    vaults,
    selectedVaultId,
    selectVault,
    items,
    loading,
    error,
    reloadVaults: loadVaults,
    reloadItems: () => loadItems(selectedVaultId),
  }), [vaults, selectedVaultId, items, loading, error, loadVaults, loadItems]);

  return (
    <VaultsContext.Provider value={value}>
      {children}
    </VaultsContext.Provider>
  );
}
