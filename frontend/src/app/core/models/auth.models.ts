export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface UserProfile {
  id?: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'AGENT' | 'SUPERVISOR';
