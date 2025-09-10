/**
 * Minimal API client for VaultMate Security.
 * Reads base URL from REACT_APP_API_BASE env (configured at build/runtime).
 * Includes bearer token when available.
 */

// PUBLIC_INTERFACE
export const API_BASE = process.env.REACT_APP_API_BASE || '';

function getHeaders(withAuth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const access = localStorage.getItem('vm_access');
    if (access) headers['Authorization'] = `Bearer ${access}`;
  }
  return headers;
}

// PUBLIC_INTERFACE
export async function apiGet(path, withAuth = true) {
  const res = await fetch(API_BASE + path, { headers: getHeaders(withAuth) });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, withAuth = true) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: getHeaders(withAuth),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPatch(path, body, withAuth = true) {
  const res = await fetch(API_BASE + path, {
    method: 'PATCH',
    headers: getHeaders(withAuth),
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiDelete(path, withAuth = true) {
  const res = await fetch(API_BASE + path, {
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
