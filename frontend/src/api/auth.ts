import { api, saveToken, clearToken } from './client';

export interface User {
  id: string;
  name: string;
  phone: string;
  village: string;
  language: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(data: {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  village?: string;
  language?: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/register', data);
  saveToken(res.token);
  return res;
}

export async function login(data: {
  phone: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  saveToken(res.token);
  return res;
}

export function logout(): void {
  clearToken();
}
