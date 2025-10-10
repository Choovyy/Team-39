// Global axios configuration for SPEAR (Vite)
// Purpose: When deployed on Netlify, code that uses full URLs like
//   http://{window.location.hostname}:8080/path
// would point to the Netlify host, not your backend. This interceptor
// rewrites any absolute URL that targets port 8080 to the configured
// VITE_API_URL_SPEAR base.

import axios from 'axios';

// In production, route API calls through a same-origin proxy path to avoid
// mixed-content (HTTPS site calling HTTP backend). Netlify will proxy /spear/*
// to the actual backend. In dev, use VITE_API_URL_SPEAR or localhost:8080.
const isProd = !!import.meta.env?.PROD;
const devBase = (() => {
  const envBase = import.meta.env?.VITE_API_URL_SPEAR;
  if (envBase && typeof envBase === 'string' && envBase.trim()) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:8080`;
  return 'http://localhost:8080';
})();

const API_BASE = isProd ? '/spear' : devBase;

// Matches any absolute URL pointing to port 8080
const PORT_8080_REGEX = /^https?:\/\/[^/]+:8080(\/.*)?$/i;

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  try {
    const url = config?.url;
    if (typeof url !== 'string') return config;

    // In production, rewrite absolute :8080 targets to the proxy path
    if (isProd && PORT_8080_REGEX.test(url)) {
      const pathStart = url.indexOf(':8080') + 5; // position after :8080
      const path = url.slice(pathStart);
      return { ...config, url: `${API_BASE}${path}` };
    }

    // If request is already to our proxy base, leave it
    if (isProd && url.startsWith(API_BASE)) return config;

    // Otherwise, leave relative URLs as-is; dev absolute URLs go untouched
    return config;
  } catch {
    return config;
  }
}, (error) => Promise.reject(error));

export const SPEAR_API_BASE = API_BASE;
