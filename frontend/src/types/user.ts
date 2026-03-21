/**
 * User Types
 * Basado en User.cs del backend
 */

export interface User {
  id: number;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  passwordHash: string;
  refreshToken?: string | null;
  refreshTokenExpiryTime?: string | null;
  userIconUrl?: string | null;
  active: boolean;
}

export interface AuthResponse {
  userName: string;
  token: string;
}

export interface UserResponse {
  id: number;
  name: string;
  lastName: string;
  userName: string;
  email: string;
  userIconUrl: string | null;
  active: boolean;
  createdAt: string;
}

export interface UserMeResponse {
  fullName: string;
  email: string;
  userName: string;
  userIconUrl: string | null;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  userIconUrl?: string;
}
