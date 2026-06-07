/**
 * SubAccount Types
 * Basado en SubAccountResponse.cs del backend
 */

export interface SubAccount {
  id: number;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface CreateSubAccountRequest {
  name: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
