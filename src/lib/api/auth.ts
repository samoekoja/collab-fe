import { apiFetch } from './client';
import type { LoginPayload, SignupPayload, AuthResponse } from '../types/auth';

export const login = (payload: LoginPayload) => 
  apiFetch<AuthResponse>('/auth/login', 'POST', payload);

export const register = (payload: SignupPayload) =>
  apiFetch<AuthResponse>('/auth/register', 'POST', payload);

export const activateAccount = (payload: { new_password: string }) =>
  apiFetch<AuthResponse>('/auth/activate', 'POST', payload);

export const changePassword = (payload: { current_password: string; new_password: string }) =>
  apiFetch<void>('/auth/change-password', 'POST', payload);
