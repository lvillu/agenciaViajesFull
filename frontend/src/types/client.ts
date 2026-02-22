/**
 * Client Types
 * Basado en Client.cs del backend
 */

export interface Client {
  id: number;
  name: string;
  lastName: string;
  address?: string;
  phone: string;
  email: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  active: boolean;
}

export interface CreateClientRequest {
  name: string;
  lastName: string;
  address?: string;
  phone: string;
  email: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
}

export interface UpdateClientRequest {
  name: string;
  lastName: string;
  address?: string;
  phone: string;
  email: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  active: boolean;
}
