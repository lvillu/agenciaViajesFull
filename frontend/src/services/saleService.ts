/**
 * Sale Service
 * Servicios de gestión de ventas
 */

import { apiClient } from './apiClient';
import { ApiResponse } from '@/types/api';
import {
  Sale,
  SaleWithTotals,
  CreateSaleRequest,
  UpdateSaleRequest,
} from '@/types/sale';
import { Payment } from '@/types/payment';
import { SALE_ENDPOINTS, PAYMENT_ENDPOINTS } from '@/lib/constants';

export const saleService = {
  /**
   * Obtiene la lista de todas las ventas
   */
  async getAll(includeInactive: boolean = false): Promise<Sale[]> {
    const response = await apiClient.get<ApiResponse<Sale[]>>(
      SALE_ENDPOINTS.LIST,
      {
        params: { includeInactive },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar ventas');
    }

    return response.data.data;
  },

  /**
   * Obtiene una venta por ID con información completa
   */
  async getById(id: number): Promise<Sale> {
    const response = await apiClient.get<ApiResponse<Sale>>(
      SALE_ENDPOINTS.BY_ID(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Venta no encontrada');
    }

    return response.data.data;
  },

  /**
   * Obtiene una venta con totales calculados
   */
  async getByIdWithTotals(id: number): Promise<SaleWithTotals> {
    const sale = await this.getById(id);
    return this.calculateTotals(sale);
  },

  /**
   * Obtiene los pagos de una venta específica
   */
  async getPayments(saleId: number): Promise<Payment[]> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(
      PAYMENT_ENDPOINTS.LIST,
      {
        params: { saleId },
      }
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al cargar pagos');
    }

    return response.data.data;
  },

  /**
   * Crea una nueva venta
   */
  async create(sale: CreateSaleRequest): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(
      SALE_ENDPOINTS.CREATE,
      sale
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al crear venta');
    }

    return response.data.data;
  },

  /**
   * Actualiza una venta existente
   */
  async update(id: number, sale: UpdateSaleRequest): Promise<Sale> {
    const response = await apiClient.put<ApiResponse<Sale>>(
      SALE_ENDPOINTS.UPDATE(id),
      sale
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al actualizar venta');
    }

    return response.data.data;
  },

  /**
   * Elimina (da de baja) una venta
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      SALE_ENDPOINTS.DELETE(id)
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || 'Error al eliminar venta');
    }
  },

  /**
   * Calcula totales y estado de una venta
   * Utiliza los totales del backend si están disponibles
   */
  calculateTotals(sale: Sale): SaleWithTotals {
    // Si el backend ya calculó los totales, usarlos
    const totalPaid = sale.totalPaid !== undefined 
      ? sale.totalPaid 
      : (sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
    
    const balance = sale.remainingBalance !== undefined
      ? sale.remainingBalance
      : (sale.totalAmount - totalPaid);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const finalPaymentDate = sale.finalPaymentDueDate 
      ? new Date(sale.finalPaymentDueDate)
      : null;
    
    const travelDate = new Date(sale.travelDate);
    
    const isOverdue = finalPaymentDate 
      ? finalPaymentDate < today && balance > 0
      : false;
    
    // Si la fecha de anticipo pasó o es menor a la fecha de viaje, requiere pago total
    const requiresFullPayment = finalPaymentDate 
      ? finalPaymentDate <= travelDate
      : false;

    return {
      ...sale,
      totalPaid,
      balance,
      isOverdue,
      requiresFullPayment,
    };
  },

  /**
   * Calcula la fecha de liquidación final basada en el proveedor
   */
  calculateFinalPaymentDate(
    travelDate: string,
    finalPaymentDaysBefore?: number
  ): string | undefined {
    if (!finalPaymentDaysBefore || finalPaymentDaysBefore <= 0) {
      return undefined;
    }

    const travel = new Date(travelDate);
    const finalPayment = new Date(travel);
    finalPayment.setDate(travel.getDate() - finalPaymentDaysBefore);

    return finalPayment.toISOString().split('T')[0];
  },

  /**
   * Calcula el anticipo requerido basado en el proveedor
   */
  calculateRequiredDeposit(
    totalAmount: number,
    depositPercentage?: number
  ): number | undefined {
    if (!depositPercentage || depositPercentage <= 0) {
      return undefined;
    }

    return (totalAmount * depositPercentage) / 100;
  },
};
