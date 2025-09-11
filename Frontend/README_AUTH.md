# Supabase Auth Integration (Frontend)

This frontend is configured to use Supabase Auth for user registration and login.

What changed:
- Replaced custom FastAPI auth calls with Supabase Auth via @supabase/supabase-js.
- AuthContext now uses supabase.auth (signUp, signInWithPassword, signOut, getSession).
- Tokens are managed by the Supabase SDK; vm_access/vm_refresh are no longer used.
- MFA flows against the backend are disabled in this UI (placeholders will throw an error).

Environment variables (Create React App):
- REACT_APP_SUPABASE_URL: Your Supabase project URL (e.g., https://xyzcompany.supabase.co)
- REACT_APP_SUPABASE_ANON_KEY: Your Supabase anonymous public key (JWT-like string starting with ey...)
- REACT_APP_API_BASE (optional): Backend base URL for non-auth endpoints

Do not use SUPABASE_URL / SUPABASE_KEY directly in CRA builds; use the REACT_APP_ prefixed variables above.

Runtime overrides (no rebuild needed):
- localStorage key vm_supabase_url
- localStorage key vm_supabase_key
A small "Supabase" panel is available at the bottom-left of the app to view/apply overrides and check if values look valid.

Example env:
- See Frontend/.env.example

Troubleshooting “Invalid API key”:
- Ensure you are using the anon public key from Project Settings → API (NOT service_role)
- Verify the URL exactly matches https://<your-project>.supabase.co
- Keys should be JWT-like (three segments separated by dots), often starting with ey
- If building locally, restart `npm start` after creating .env.local
- In the app, open the Supabase panel and paste URL and anon key; it validates their shape and reconfigures the client live.

Notes:
- If your Supabase project requires email confirmation, users must verify their email before sign-in.
- To customize auth email redirect, set REACT_APP_SITE_URL and update the commented emailRedirectTo in AuthContext register.
