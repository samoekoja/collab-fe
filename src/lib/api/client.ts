import { API_BASE } from './config';
import type { ApiResponse } from '../types/api';

export async function apiFetch<T>(
  endpoint: string,
  method = 'GET',
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem('rc_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? 'API Error');
  }
  
  return json.data as T;
}

// Utility to safely extract string ID whether backend sends `_id: { $oid: "..." }` or `_id: "..."`
export function extractId(obj: any): string {
  if (!obj || !obj._id) return '';
  return typeof obj._id === 'string' ? obj._id : obj._id.$oid;
}
