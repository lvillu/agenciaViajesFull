import { z } from 'zod';

/**
 * Payment Types
 * Basado en Payment.cs del backend
 */

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

export interface CreatePaymentRequest {
  saleId: number;
  paymentDate: string; // ISO date string (YYYY-MM-DD)
  amount: number;
  exchangeRate?: number;
  amountMXN?: number;
  notes?: string;
}

export interface UpdatePaymentRequest {
  paymentDate: string; // ISO date string (YYYY-MM-DD)
  amount: number;
  exchangeRate?: number;
  amountMXN?: number;
  notes?: string;
}

// Esquema de validación para crear pago
export const CreatePaymentSchema = z.object({
  saleId: z.number().min(1, 'ID de venta es requerido'),
  paymentDate: z.string().min(1, 'La fecha de pago es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  exchangeRate: z.number().min(0).optional(),
  amountMXN: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Esquema de validación para actualizar pago
export const UpdatePaymentSchema = z.object({
  paymentDate: z.string().min(1, 'La fecha de pago es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  exchangeRate: z.number().min(0).optional(),
  amountMXN: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type CreatePaymentFormData = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentFormData = z.infer<typeof UpdatePaymentSchema>;
