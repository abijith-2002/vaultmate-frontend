# VaultMate Security – Frontend

React app for VaultMate Security with API integration, MFA, credential vault, sharing, admin, and accessible onboarding.

## Quick start
1. Copy environment example and set backend base URL:
   cp .env.example .env
   # edit .env and set REACT_APP_API_BASE to your backend URL (e.g. http://localhost:3001)
2. Install dependencies:
   npm install
3. Start:
   npm start

## Environment
- REACT_APP_API_BASE: Base URL of the Backend (FastAPI) endpoints, e.g. http://localhost:3001

## Theming
- Font: Google Fonts "Reddit Mono"
- Colors:
  - rich-black: #131b23 (backgrounds)
  - indian-red: #c1666b (primary accents/buttons)
  - cambridge-blue: #8aa29e (secondary accents)
- See src/index.css for CSS variables and components.

## Features
- Registration, Login, Logout
- MFA setup and verification
- Vault: list, create, edit, delete items
- Password generator and strength check
- Sharing: share/unshare item by email
- Admin: users list, role updates, system health, audit logs
- Onboarding and Help pages
- Accessible (WCAG 2.1) and responsive layouts

## Notes
- The app uses Bearer tokens stored in localStorage (vm_access, vm_refresh).
- All API endpoints follow the provided OpenAPI spec.
- Only client-side ciphertext of secrets is displayed/stored as per backend design.
