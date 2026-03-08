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
  profitPercentage?: number;
  exchangeRate?: number; // Tipo de cambio (solo si isDollar es true)
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
  profitPercentage?: number;
  exchangeRate?: number; // Tipo de cambio (solo si isDollar es true)
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
  profitPercentage?: number;
  exchangeRate?: number; // Tipo de cambio (solo si isDollar es true)
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
  profitPercentage: z.number().min(0, 'El porcentaje debe ser mayor o igual a 0').max(100, 'El porcentaje no puede superar 100').optional(),
  exchangeRate: z.number().min(0.01, 'El tipo de cambio debe ser mayor a 0').optional(),
  requiredDeposit: z.number().min(0).optional(),
  finalPaymentDueDate: z.string().optional(),
  travelDate: z.string().min(1, 'La fecha de viaje es requerida'),
  returnDate: z.string().optional(),
  status: z.string().optional(),
}).refine((data) => {
  // Validar que la fecha de retorno no sea menor a la fecha de viaje
  if (data.returnDate && data.travelDate) {
    return new Date(data.returnDate) >= new Date(data.travelDate);
  }
  return true;
}, {
  message: 'La fecha de retorno no puede ser menor a la fecha de viaje',
  path: ['returnDate'],
}).refine((data) => {
  // Validar que la fecha de liquidación no sea mayor a la fecha de viaje
  if (data.finalPaymentDueDate && data.travelDate) {
    return new Date(data.finalPaymentDueDate) <= new Date(data.travelDate);
  }
  return true;
}, {
  message: 'La fecha de liquidación no puede ser mayor a la fecha de viaje',
  path: ['finalPaymentDueDate'],
}).refine((data) => {
  // Validar que si es en dólares, el tipo de cambio sea requerido
  if (data.isDollar && !data.exchangeRate) {
    return false;
  }
  return true;
}, {
  message: 'El tipo de cambio es requerido para reservas en dólares',
  path: ['exchangeRate'],
});

// Esquema de validación para actualizar venta
export const UpdateSaleSchema = z.object({
  clientId: z.number().min(1, 'Debe seleccionar un cliente'),
  providerId: z.number().min(1, 'Debe seleccionar un proveedor'),
  reservationNumber: z.string().optional(),
  description: z.string().optional(),
  totalAmount: z.number().min(0.01, 'El monto total debe ser mayor a 0'),
  isDollar: z.boolean(),
  profitPercentage: z.number().min(0, 'El porcentaje debe ser mayor o igual a 0').max(100, 'El porcentaje no puede superar 100').optional(),
  exchangeRate: z.number().min(0.01, 'El tipo de cambio debe ser mayor a 0').optional(),
  requiredDeposit: z.number().min(0).optional(),
  finalPaymentDueDate: z.string().optional(),
  travelDate: z.string().min(1, 'La fecha de viaje es requerida'),
  returnDate: z.string().optional(),
  status: z.string().optional(),
  active: z.boolean(),
}).refine((data) => {
  // Validar que la fecha de retorno no sea menor a la fecha de viaje
  if (data.returnDate && data.travelDate) {
    return new Date(data.returnDate) >= new Date(data.travelDate);
  }
  return true;
}, {
  message: 'La fecha de retorno no puede ser menor a la fecha de viaje',
  path: ['returnDate'],
}).refine((data) => {
  // Validar que la fecha de liquidación no sea mayor a la fecha de viaje
  if (data.finalPaymentDueDate && data.travelDate) {
    return new Date(data.finalPaymentDueDate) <= new Date(data.travelDate);
  }
  return true;
}, {
  message: 'La fecha de liquidación no puede ser mayor a la fecha de viaje',
  path: ['finalPaymentDueDate'],
}).refine((data) => {
  // Validar que si es en dólares, el tipo de cambio sea requerido
  if (data.isDollar && !data.exchangeRate) {
    return false;
  }
  return true;
}, {
  message: 'El tipo de cambio es requerido para reservas en dólares',
  path: ['exchangeRate'],
});

export type CreateSaleFormData = z.infer<typeof CreateSaleSchema>;
export type UpdateSaleFormData = z.infer<typeof UpdateSaleSchema>;

// Información extendida de venta (con totales calculados)
export interface SaleWithTotals extends Sale {
  totalPaid: number; // Total pagado
  balance: number; // Saldo pendiente
  isOverdue: boolean; // Si pasó la fecha de liquidación
  requiresFullPayment: boolean; // Si requiere pago total
  profitAmount?: number; // Monto de ganancia calculado por el backend
}
