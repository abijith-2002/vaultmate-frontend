// PUBLIC_INTERFACE
export function maskSecret(shown, secret) {
  /** Returns either masked bullets or the actual secret. */
  return shown ? secret : '•'.repeat(Math.max(8, Math.min(16, secret?.length || 8)));
}
