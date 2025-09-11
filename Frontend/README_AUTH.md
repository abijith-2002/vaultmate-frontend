# VaultMate Frontend Auth (Minimal)

This UI provides minimal Login and Signup pages, styled with:
- Colors: rich-black (#131b23), indian-red (#c1666b), cambridge-blue (#8aa29e)
- Font: Figtree (Google Fonts)
- Tokens stored in localStorage: vm_access, vm_refresh

Configure API base:
- Option 1: Set REACT_APP_API_BASE in environment (e.g., http://localhost:8000)
- Option 2: At runtime via localStorage key vm_api_base

Endpoints wired:
- POST /auth/login  body { email, password, mfa_otp? }
- POST /auth/register body { email, password, full_name?, admin_invite_code? }

Pages:
- /login (default)
- /register

Notes:
- All typography uses Figtree.
- Background uses rich-black, surfaces are dark, buttons use indian-red, accents use cambridge-blue.
