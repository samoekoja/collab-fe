import { apiFetch } from './client';
import type { ClientRequest, CreateClientRequestPayload, UpdateClientRequestPayload } from '../types/market';

export async function listClientRequests(projectId: string): Promise<ClientRequest[]> {
  return await apiFetch(`/api/projects/${projectId}/market/requests`);
}

export async function createClientRequest(projectId: string, payload: CreateClientRequestPayload): Promise<ClientRequest> {
  return await apiFetch(`/api/projects/${projectId}/market/requests`, 'POST', payload);
}

export async function updateClientRequest(projectId: string, reqId: string, payload: UpdateClientRequestPayload): Promise<ClientRequest> {
  return await apiFetch(`/api/projects/${projectId}/market/requests/${reqId}`, 'PATCH', payload);
}

export async function deleteClientRequest(projectId: string, reqId: string): Promise<void> {
  return await apiFetch(`/api/projects/${projectId}/market/requests/${reqId}`, 'DELETE');
}
