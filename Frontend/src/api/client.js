/**
 * Minimal API client for VaultMate Security with dynamic base URL.
 * - Initializes base from localStorage('vm_api_base') or REACT_APP_API_BASE.
 * - Exposes getApiBase/setApiBase for runtime updates.
 * - Includes bearer token when available.
 */

const ENV_BASE = process.env.REACT_APP_API_BASE || '';

const API_BASE_KEY = 'vm_api_base';

// Initialize base URL from localStorage or env
let apiBase = (() => {
  const stored = localStorage.getItem(API_BASE_KEY);
  return normalizeBase(stored || ENV_BASE || '');
})();

function normalizeBase(base) {
  if (!base) return '';
  try {
    // Trim spaces and trailing slash
    const b = String(base).trim().replace(/\/+$/, '');
    return b;
  } catch {
    return '';
  }
}

function getHeaders(withAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const access = localStorage.getItem('vm_access');
    if (access) headers['Authorization'] = `Bearer ${access}`;
  }
  return headers;
}

function url(path) {
  // Ensure path starts with /
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${p}`;
}

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Get the current API base URL used by the client. */
  return apiBase;
}

// PUBLIC_INTERFACE
export function setApiBase(newBase) {
  /** Set and persist the API base URL; subsequent requests use this base. */
  apiBase = normalizeBase(newBase);
  if (apiBase) localStorage.setItem(API_BASE_KEY, apiBase);
  else localStorage.removeItem(API_BASE_KEY);
  return apiBase;
}

// PUBLIC_INTERFACE
export async function apiGet(path, withAuth = true) {
  /** Perform a GET request against the configured API base. */
  const res = await fetch(url(path), { headers: getHeaders(withAuth) });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, withAuth = true) {
  /** Perform a POST request against the configured API base. */
  const res = await fetch(url(path), {
    method: 'POST',
    headers: getHeaders(withAuth),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPatch(path, body, withAuth = true) {
  /** Perform a PATCH request against the configured API base. */
  const res = await fetch(url(path), {
    method: 'PATCH',
    headers: getHeaders(withAuth),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiDelete(path, withAuth = true) {
  /** Perform a DELETE request against the configured API base. */
  const res = await fetch(url(path), {
    method: 'DELETE',
    headers: getHeaders(withAuth),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

async function toError(res) {
  let payload = {};
  try { payload = await res.json(); } catch (e) {
    // ignore body parse error
  }
  const message = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.payload = payload;
  return err;
}
