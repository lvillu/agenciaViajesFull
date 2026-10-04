/**
 * API Client
 * Cliente HTTP centralizado con Axios
 * Comunica con KrakenD Gateway (puerto 5050)
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { refreshSession } from '@/services/refreshService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

// Endpoints de autenticación: un 401 aquí nunca dispara refresh ni redirect
const AUTH_PATHS = ['/login', '/signup', '/refresh', '/logout'];

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fuera del árbol de React no hay acceso a useRouter: se navega con location.
function redirectToLogin(): void {
  if (typeof window === 'undefined' || window.location.pathname === '/login') {
    return;
  }

  useAuthStore.getState().logout();

  const returnTo = encodeURIComponent(
    window.location.pathname + window.location.search
  );
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/login?returnTo=${returnTo}`;
}

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const url: string = originalRequest?.url ?? '';
    const isAuthPath = AUTH_PATHS.some((path) => url.includes(path));

    // 401 en una petición de negocio: renueva el access token y reintenta una vez
    if (error.response?.status === 401 && originalRequest && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshSession();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      // No se pudo renovar: la sesión terminó de verdad
      redirectToLogin();
      return Promise.reject(error);
    }

    // Extraer mensaje del backend en errores 400+ (formato ApiResponse)
    if (error.response?.data?.message && error.response?.status >= 400) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
