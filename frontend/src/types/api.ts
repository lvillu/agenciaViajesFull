/**
 * API Response Types
 * Estructura genérica de respuestas del backend
 */

export interface ApiResponse<T> {
  data: T;
  status: 'Completed' | 'Failure';
  message: string;
  isSuccess: boolean;
}

/**
 * Página de resultados (Fase 3: los listados del backend son paginados).
 */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PagedQuery {
  page?: number;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 20;
