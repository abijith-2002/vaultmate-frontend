import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client factory and accessors.
 * Reads from:
 * - REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY (build time)
 * - localStorage overrides 'vm_supabase_url' and 'vm_supabase_key' (runtime)
 *
 * Do not hardcode secrets in code. For deployment, set environment variables.
 */

const ENV_URL = process.env.REACT_APP_SUPABASE_URL || '';
const ENV_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const LS_URL_KEY = 'vm_supabase_url';
const LS_KEY_KEY = 'vm_supabase_key';

function getRuntimeUrl() {
  const v = localStorage.getItem(LS_URL_KEY);
  return (v && v.trim()) || ENV_URL;
}

function getRuntimeKey() {
  const v = localStorage.getItem(LS_KEY_KEY);
  return (v && v.trim()) || ENV_KEY;
}

let supabase = null;

// PUBLIC_INTERFACE
export function getSupabase() {
  /** Returns a singleton Supabase client configured from env/runtime. */
  if (!supabase) {
    const url = getRuntimeUrl();
    const key = getRuntimeKey();
    if (!url || !key) {
      // Create a dummy client to avoid crashes; calls will fail gracefully.
      console.warn('Supabase URL/KEY not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY or runtime overrides.');
    }
    supabase = createClient(url || 'https://example.invalid', key || 'public-anon-key');
  }
  return supabase;
}

// PUBLIC_INTERFACE
export function reconfigureSupabase(url, key) {
  /** Recreate client with new configuration (e.g., after runtime override). */
  supabase = createClient(url, key);
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
  };
}
