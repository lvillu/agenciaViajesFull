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

export const CLIENT_ENDPOINTS = {
  BASE: '/Client',
  LIST: '/Client',
  BY_ID: (id: number) => `/Client/${id}`,
  CREATE: '/Client',
  UPDATE: (id: number) => `/Client/${id}`,
  DELETE: (id: number) => `/Client/${id}`,
};

export const SALE_ENDPOINTS = {
  BASE: '/Sale',
  LIST: '/Sale',
  BY_ID: (id: number) => `/Sale/${id}`,
  CREATE: '/Sale',
  UPDATE: (id: number) => `/Sale/${id}`,
  DELETE: (id: number) => `/Sale/${id}`,
};

export const PAYMENT_ENDPOINTS = {
  BASE: '/Payment',
  LIST: '/Payment',
  BY_ID: (id: number) => `/Payment/${id}`,
  CREATE: '/Payment',
  UPDATE: (id: number) => `/Payment/${id}`,
  DELETE: (id: number) => `/Payment/${id}`,
};
