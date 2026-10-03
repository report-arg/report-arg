import axios from 'axios';
import { getSession } from 'next-auth/react';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache en memoria para evitar llamadas redundantes a /api/auth/session por cada petición
let cachedSession = null;
let lastSessionFetch = 0;
let pendingSessionPromise = null;
const SESSION_CACHE_TTL = 10000; // 10 segundos de vigencia en cliente

export function clearSessionCache() {
  cachedSession = null;
  lastSessionFetch = 0;
  pendingSessionPromise = null;
}

async function getAuthSession() {
  const now = Date.now();
  if (cachedSession && now - lastSessionFetch < SESSION_CACHE_TTL) {
    return cachedSession;
  }

  // Si ya hay una petición en curso a /api/auth/session, compartirla para evitar ráfagas simultáneas
  if (pendingSessionPromise) {
    return pendingSessionPromise;
  }

  pendingSessionPromise = getSession()
    .then((session) => {
      cachedSession = session;
      lastSessionFetch = Date.now();
      return session;
    })
    .catch((err) => {
      console.error('Error al resolver la sesión en apiClient:', err);
      return null;
    })
    .finally(() => {
      pendingSessionPromise = null;
    });

  return pendingSessionPromise;
}

apiClient.interceptors.request.use(
  async (config) => {
    // Inyectar el token de sesión de NextAuth si está disponible (lado del cliente)
    if (typeof window !== 'undefined') {
      const session = await getAuthSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } else {
      console.warn('apiClient.js se está usando en el lado del servidor (SSR). getSession() no inyectará el token.');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la sesión expiró o es inválida, limpiar cache
    if (error.response?.status === 401) {
      clearSessionCache();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
