import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client factory and accessors.
 * Reads from:
 * - REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY (build time)
 * - localStorage overrides 'vm_supabase_url' and 'vm_supabase_key' (runtime)
 *
 * Do not hardcode secrets in code. For deployment, set environment variables.
 * This module validates that the URL and anon key look correct to prevent
 * "Invalid API key" issues due to typos or wrong key type.
 */

const ENV_URL = process.env.REACT_APP_SUPABASE_URL || '';
const ENV_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const LS_URL_KEY = 'vm_supabase_url';
const LS_KEY_KEY = 'vm_supabase_key';

/** Heuristic validation for Supabase project URL. */
function isLikelyValidUrl(u) {
  if (!u || typeof u !== 'string') return false;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  // Must be the Supabase domain
  if (!/\.supabase\.co$/i.test(new URL(s).hostname)) return false;
  return true;
}

/** Heuristic validation for anon key shape (JWT-like base64url segments). */
function isLikelyValidAnonKey(k) {
  if (!k || typeof k !== 'string') return false;
  const s = k.trim();
  // Supabase anon keys are JWTs with three dot-separated segments
  if (s.split('.').length !== 3) return false;
  // Typically starts with ey for base64url header
  if (!/^ey/.test(s)) return false;
  return true;
}

function getRuntimeUrl() {
  const v = localStorage.getItem(LS_URL_KEY);
  return (v && v.trim()) || ENV_URL;
}

function getRuntimeKey() {
  const v = localStorage.getItem(LS_KEY_KEY);
  return (v && v.trim()) || ENV_KEY;
}

let supabase = null;

/** Create a client after validating URL/key; logs clear diagnostics. */
function createValidatedClient(url, key) {
  const urlOk = isLikelyValidUrl(url);
  const keyOk = isLikelyValidAnonKey(key);

  if (!urlOk || !keyOk) {
    const problems = [];
    if (!urlOk) problems.push('Supabase URL is missing or not a valid https://<project>.supabase.co URL');
    if (!keyOk) problems.push('Supabase anon key is missing or malformed (must be the public anon JWT, not service_role)');
    // Provide explicit guidance in console
    // eslint-disable-next-line no-console
    console.error(
      'Supabase configuration invalid:',
      { url, urlOk, keyPresent: !!key, keyOk }
    );
    // eslint-disable-next-line no-console
    console.warn(
      'Fix by setting REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY at build time, or set localStorage vm_supabase_url/vm_supabase_key at runtime. ' +
      'Ensure you use the "anon public" key from Project settings → API, not the service role key.'
    );
    throw new Error(problems.join(' • '));
  }

  // Create client with default options; you can customize auth storage if needed.
  return createClient(url, key);
}

// PUBLIC_INTERFACE
export function getSupabase() {
  /** Returns a singleton Supabase client configured from env/runtime. */
  if (!supabase) {
    const url = getRuntimeUrl();
    const key = getRuntimeKey();

    try {
      supabase = createValidatedClient(url, key);
    } catch (e) {
      // As a fallback, create a client with placeholders so UI can still render,
      // but subsequent auth calls will show friendly errors surfaced by AuthContext.
      // eslint-disable-next-line no-console
      console.warn('Falling back to placeholder Supabase client due to invalid config:', e?.message);
      supabase = createClient('https://example.invalid', 'invalid.invalid.invalid');
    }
  }
  return supabase;
}

// PUBLIC_INTERFACE
export function reconfigureSupabase(url, key) {
  /** Recreate client with new configuration (e.g., after runtime override). */
  try {
    supabase = createValidatedClient(url, key);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Supabase reconfiguration failed:', e?.message);
    throw e;
  }
  return supabase;
}

// PUBLIC_INTERFACE
export function getSupabaseConfig() {
  /** Returns the current effective Supabase configuration (url/key redacted). */
  const url = getRuntimeUrl();
  const key = getRuntimeKey();
  return {
    url,
    keyPresent: !!key,
    // For quick troubleshooting in UI/QA:
    issues: {
      urlLikelyValid: isLikelyValidUrl(url),
      keyLikelyValid: isLikelyValidAnonKey(key),
    }
  };
}
