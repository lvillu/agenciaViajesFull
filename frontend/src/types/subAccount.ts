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
  role: string;
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

export interface UpdateSubAccountRequest {
  name?: string;
  lastName?: string;
  email?: string;
  active?: boolean;
}
