# Supabase Integration Notes (Frontend)

This frontend uses Supabase Auth via @supabase/supabase-js.

IMPORTANT: Environment variables must be provided. At minimum:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_SITE_URL (recommended for consistent auth redirects)

See Frontend/.env.example for a template.

Environment variables:
- REACT_APP_SUPABASE_URL: Supabase project URL (e.g., https://xyzcompany.supabase.co)
- REACT_APP_SUPABASE_ANON_KEY: Supabase public anon key
- REACT_APP_API_BASE (optional): Backend base URL for non-auth endpoints

Runtime overrides (useful for preview environments):
- localStorage key vm_supabase_url
- localStorage key vm_supabase_key

Auth flows implemented:
- Sign up: supabase.auth.signUp({ email, password, options: { data: { full_name }}})
- Sign in: supabase.auth.signInWithPassword({ email, password })
- Sign out: supabase.auth.signOut()
- Session restore: supabase.auth.getSession() on load and onAuthStateChange subscription

Email confirmations:
- If enabled in Supabase, users will receive a confirmation email.
- You may set emailRedirectTo to REACT_APP_SITE_URL in AuthContext register if needed.

Security:
- Do not hardcode Supabase keys in code; use environment variables managed by deployment.
- The ANON key is public but should still be managed via envs.
