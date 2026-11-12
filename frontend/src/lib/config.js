export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== ''
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
    : import.meta.env.PROD
      ? 'https://ai-smart-farming-system-if62.onrender.com'
      : 'http://localhost:8000';
