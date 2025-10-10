// Global axios configuration for SPEAR (Vite)
// Purpose: When deployed on Netlify, code that uses full URLs like
//   http://{window.location.hostname}:8080/path
// would point to the Netlify host, not your backend. This interceptor
// rewrites any absolute URL that targets port 8080 to the configured
// VITE_API_URL_SPEAR base.

import axios from 'axios';

function getApiBase() {
  // Prefer env base when provided; fallback keeps local dev behavior.
  const envBase = import.meta.env?.VITE_API_URL_SPEAR;
  if (envBase && typeof envBase === 'string' && envBase.trim().length > 0) {
    return envBase.replace(/\/$/, ''); // strip trailing slash
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }
  // Server-side fallback (rare for Vite SPA)
  return 'http://localhost:8080';
}

const API_BASE = getApiBase();

// Matches any absolute URL pointing to port 8080
const PORT_8080_REGEX = /^https?:\/\/[^/]+:8080(\/.*)?$/i;

axios.interceptors.request.use((config) => {
  try {
    const url = config?.url;
    if (typeof url !== 'string') return config;

    // If URL is already relative, let it pass through
    if (url.startsWith('/') && !url.startsWith('//')) return config;

    // If already points to API_BASE, do nothing
    if (url.startsWith(API_BASE)) return config;

    // If it targets any host on port 8080, rewrite to API_BASE
    if (PORT_8080_REGEX.test(url)) {
      // Extract path after host:port
      const pathStart = url.indexOf(':8080') + 5; // position after :8080
      const path = url.slice(pathStart);
      const merged = `${API_BASE}${path}`;
      return { ...config, url: merged };
    }

    return config;
  } catch {
    return config;
  }
}, (error) => Promise.reject(error));

// Optionally expose base for debugging
export const SPEAR_API_BASE = API_BASE;
