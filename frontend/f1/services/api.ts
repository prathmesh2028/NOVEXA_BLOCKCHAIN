/**
 * KavachTrust — Base API Client
 */

export function resolveBaseUrl(): string {
  // 1. Check local storage override if user configured one
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('kavach_api_url');
    if (custom) {
      const clean = custom.trim().replace(/\/$/, '');
      return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
    }
  }

  // 2. Vite environment variable
  const raw = (import.meta.env?.VITE_API_URL || '').trim().replace(/\/$/, '');

  // Keep local development convenient, but never silently target localhost in a deployed build.
  if (!raw) {
    if (import.meta.env.PROD) {
      throw new Error('VITE_API_URL is required for production builds');
    }
    return 'http://localhost:10000/api/v1';
  }

  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

export const API_BASE_URL = resolveBaseUrl();

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any, message: string) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function executeFetch(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${baseUrl}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('kavach_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const primaryBase = resolveBaseUrl();
  let response: Response;

  try {
    response = await executeFetch(primaryBase, endpoint, options);
  } catch (netErr: any) {
    // If the primary URL is remote (e.g. Render) and fails when running locally,
    // automatically failover to the local NestJS backend at http://localhost:8000/api/v1
    const isLocalClient = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalClient && !primaryBase.includes('localhost') && !primaryBase.includes('127.0.0.1')) {
      console.warn(`Primary API (${primaryBase}) unreachable. Retrying with local backend (http://localhost:8000/api/v1)...`);
      try {
        response = await executeFetch('http://localhost:8000/api/v1', endpoint, options);
      } catch {
        throw new ApiError(0, null, `Network error: Could not reach backend server at ${primaryBase} or http://localhost:8000/api/v1`);
      }
    } else {
      throw new ApiError(0, null, `Network error: Could not connect to backend at ${primaryBase}`);
    }
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Don't auto-clear token - let the user see the error and decide when to re-login
    // Only clear on explicit 401 (unauthorized/expired), not on 403 (permission issue)
    if (response.status === 401) {
      console.warn(`Authentication error (401), clearing token`);
      localStorage.removeItem('kavach_token');
      localStorage.removeItem('kavach_user');
    }

    const errorMsg = Array.isArray(data?.message) 
      ? data.message.join(', ')
      : (data?.message || data?.detail || response.statusText || 'API Request Failed');

    throw new ApiError(
      response.status,
      data,
      errorMsg
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
