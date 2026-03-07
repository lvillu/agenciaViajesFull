import { z } from 'zod';

/**
 * Sale Types
 * Basado en Sale.cs del backend
 */

export interface Sale {
  id: number;
  clientId: number;
  providerId: number;
  reservationNumber?: string;
  description?: string;
  totalAmount: number;
  isDollar: boolean;
  requiredDeposit?: number;
  finalPaymentDueDate?: string; // ISO date string (YYYY-MM-DD)
  travelDate: string; // ISO date string (YYYY-MM-DD)
  returnDate?: string; // ISO date string (YYYY-MM-DD)
  status?: string;
  active: boolean;
  totalPaid?: number; // Calculado por el backend
  remainingBalance?: number; // Calculado por el backend
  createdAt?: string;
  modifiedAt?: string;
  
  // Nombres enviados por el backend (strings simples)
  clientName?: string; // Nombre completo del cliente
  providerName?: string; // Nombre del proveedor
  
  // Navigation properties (cuando se incluyen en la respuesta)
  client?: {
    id: number;
    name: string;
    lastName: string;
  };
  provider?: {
    id: number;
    name: string;
    acronym: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: number;
  saleId: number;
  paymentDate: string; // ISO date string (YYYY-MM-DD)
  amount: number;
  exchangeRate?: number;
  amountMXN?: number;
  notes?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateSaleRequest {
  clientId: number;
  providerId: number;
  reservationNumber?: string;
  description?: string;
  totalAmount: number;
  isDollar: boolean;
  requiredDeposit?: number;
  finalPaymentDueDate?: string; // ISO date string (YYYY-MM-DD)
  travelDate: string; // ISO date string (YYYY-MM-DD)
  returnDate?: string; // ISO date string (YYYY-MM-DD)
  status?: string;
}

export interface UpdateSaleRequest {
  clientId: number;
  providerId: number;
  reservationNumber?: string;
  description?: string;
  totalAmount: number;
  isDollar: boolean;
  requiredDeposit?: number;
  finalPaymentDueDate?: string; // ISO date string (YYYY-MM-DD)
  travelDate: string; // ISO date string (YYYY-MM-DD)
  returnDate?: string; // ISO date string (YYYY-MM-DD)
  status?: string;
  active: boolean;
}

// Esquema de validación para crear venta
export const CreateSaleSchema = z.object({
  clientId: z.number().min(1, 'Debe seleccionar un cliente'),
  providerId: z.number().min(1, 'Debe seleccionar un proveedor'),
  reservationNumber: z.string().optional(),
  description: z.string().optional(),
  totalAmount: z.number().min(0.01, 'El monto total debe ser mayor a 0'),
  isDollar: z.boolean(),
  requiredDeposit: z.number().min(0).optional(),
  finalPaymentDueDate: z.string().optional(),
  travelDate: z.string().min(1, 'La fecha de viaje es requerida'),
  returnDate: z.string().optional(),
  status: z.string().optional(),
});

// Esquema de validación para actualizar venta
export const UpdateSaleSchema = CreateSaleSchema.extend({
  active: z.boolean(),
});

export type CreateSaleFormData = z.infer<typeof CreateSaleSchema>;
export type UpdateSaleFormData = z.infer<typeof UpdateSaleSchema>;

// Información extendida de venta (con totales calculados)
export interface SaleWithTotals extends Sale {
  totalPaid: number; // Total pagado
  balance: number; // Saldo pendiente
  isOverdue: boolean; // Si pasó la fecha de liquidación
  requiresFullPayment: boolean; // Si requiere pago total
}
