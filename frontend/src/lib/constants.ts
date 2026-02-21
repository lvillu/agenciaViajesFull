/**
 * Constants
 * Constantes de la aplicación
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

export const AUTH_ENDPOINTS = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  LOGOUT: '/logout',
};

export const USER_ENDPOINTS = {
  ME: '/User/me',
};

export const PROVIDER_ENDPOINTS = {
  BASE: '/Provider',
  LIST: '/Provider',
  BY_ID: (id: number) => `/Provider/${id}`,
  CREATE: '/Provider',
  UPDATE: (id: number) => `/Provider/${id}`,
  DELETE: (id: number) => `/Provider/${id}`,
};
