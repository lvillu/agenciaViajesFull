/**
 * Payment Service
 * Servicios de gestión de pagos
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
} from '@/types/payment';
import { PAYMENT_ENDPOINTS } from '@/lib/constants';

export const paymentService = {
  /**
   * Obtiene la lista de todos los pagos
   */
  async getAll(): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      PAYMENT_ENDPOINTS.LIST
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar pagos');
    }

    return response.data.data;
  },

  /**
   * Obtiene los pagos de una venta específica
   */
  async getBySale(saleId: number): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      PAYMENT_ENDPOINTS.LIST,
      {
        params: { saleId },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar pagos de la venta');
    }

    return response.data.data;
  },

  /**
   * Obtiene un pago por ID
   */
  async getById(id: number): Promise<Payment> {
    const response = await apiClient.get<ApiResponse<Payment>>(
      PAYMENT_ENDPOINTS.BY_ID(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Pago no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crea un nuevo pago
   */
  async create(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>(
      PAYMENT_ENDPOINTS.CREATE,
      payment
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear pago');
    }

    return response.data.data;
  },

  /**
   * Actualiza un pago existente
   */
  async update(id: number, payment: UpdatePaymentRequest): Promise<Payment> {
    const response = await apiClient.put<ApiResponse<Payment>>(
      PAYMENT_ENDPOINTS.UPDATE(id),
      payment
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar pago');
    }

    return response.data.data;
  },

  /**
   * Elimina un pago
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      PAYMENT_ENDPOINTS.DELETE(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al eliminar pago');
    }
  },

  /**
   * Calcula el monto en MXN basado en el tipo de cambio
   */
  calculateAmountMXN(amount: number, exchangeRate?: number): number | undefined {
    if (!exchangeRate || exchangeRate <= 0) {
      return undefined;
    }

    return amount * exchangeRate;
  },
};
