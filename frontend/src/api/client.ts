/**
 * API client - thin fetch wrapper with JWT attachment.
 * Reads VITE_API_BASE_URL at build time.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:4000';

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('sc_token');
}

export function saveToken(token: string): void {
  localStorage.setItem('sc_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('sc_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred';
    try {
      const body = await res.json();
      code = body.code ?? code;
      message = body.message ?? message;
    } catch (_e) {
      // ignore JSON parse errors
    }
    throw new ApiClientError(code, message, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  post: <T>(path: string, body: unknown, auth = false) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, auth),
  get: <T>(path: string, auth = false) =>
    request<T>(path, { method: 'GET' }, auth),
};
