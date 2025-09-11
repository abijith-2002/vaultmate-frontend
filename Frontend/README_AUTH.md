# Supabase Auth Integration (Frontend)

This frontend is configured to use Supabase Auth for user registration and login.

What changed:
- Replaced custom FastAPI auth calls with Supabase Auth via @supabase/supabase-js.
- AuthContext now uses supabase.auth (signUp, signInWithPassword, signOut, getSession).
- Tokens are managed by the Supabase SDK; vm_access/vm_refresh are no longer used.
- MFA flows against the backend are disabled in this UI (placeholders will throw an error).

Environment variables:
- REACT_APP_SUPABASE_URL: Your Supabase project URL
- REACT_APP_SUPABASE_ANON_KEY: Your Supabase anonymous public key
- REACT_APP_API_BASE (optional): Backend base URL for non-auth endpoints

At runtime, you can override Supabase config via localStorage:
- vm_supabase_url
- vm_supabase_key

Example .env is provided in Frontend/.env.example.

Notes:
- If your Supabase project requires email confirmation, users must verify their email before sign-in.
- To customize auth email redirect, set REACT_APP_SITE_URL and update the commented emailRedirectTo in AuthContext register.
