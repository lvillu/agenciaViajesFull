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
