/**
 * Validation Schemas
 * Esquemas de validación con Zod
 */

import { z } from 'zod';

// Esquema de validación para Login
export const loginSchema = z.object({
  userName: z
    .string()
    .min(1, 'El usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Esquema de validación para SignUp
export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'El apellido es requerido')
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    userName: z
      .string()
      .min(1, 'El usuario es requerido')
      .min(3, 'El usuario debe tener al menos 3 caracteres'),
    email: z
      .string()
      .min(1, 'El email es requerido')
      .email('Email inválido'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Debe confirmar la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signupSchema>;

// Esquema de validación para Provider
export const providerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  acronym: z
    .string()
    .min(1, 'El acrónimo es requerido')
    .min(2, 'El acrónimo debe tener al menos 2 caracteres')
    .max(10, 'El acrónimo no puede exceder 10 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  providerContactName: z
    .string()
    .min(1, 'El nombre de contacto es requerido')
    .min(2, 'El nombre de contacto debe tener al menos 2 caracteres')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres'),
  depositPercentage: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .min(0, 'El porcentaje debe ser mayor o igual a 0')
    .max(100, 'El porcentaje no puede ser mayor a 100')
    .optional(),
  finalPaymentDaysBefore: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .int('Debe ser un número entero')
    .min(0, 'Los días deben ser mayor o igual a 0')
    .optional(),
  profitPercentage: z
    .number({
      invalid_type_error: 'Debe ser un número válido',
    })
    .min(0, 'El porcentaje debe ser mayor o igual a 0')
    .max(100, 'El porcentaje no puede ser mayor a 100')
    .optional(),
  active: z.boolean().optional(),
});

export type ProviderFormData = z.infer<typeof providerSchema>;

// Esquema de validación para Client
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  birthDate: z
    .string()
    .optional()
    .or(z.literal('')),
  active: z.boolean().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
