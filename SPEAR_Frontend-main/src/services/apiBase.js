// Central API base for SPEAR frontend
// In production (Netlify), use same-origin proxy path '/spear'
// In development, target the backend on the current hostname:8080
export const API_BASE = (import.meta.env && import.meta.env.PROD)
  ? '/spear'
  : (typeof window !== 'undefined' ? `http://${window.location.hostname}:8080` : 'http://localhost:8080');
