import { apiFetch } from './client';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/project';

export const listProjects = (ownerOnly = false) => 
  apiFetch<Project[]>(`/api/projects${ownerOnly ? '?owner=me' : ''}`);

export const getProject = (id: string) => 
  apiFetch<Project>(`/api/projects/${id}`);

export const createProject = (payload: CreateProjectPayload) => 
  apiFetch<Project>('/api/projects', 'POST', payload);

export const updateProject = (id: string, payload: UpdateProjectPayload) => 
  apiFetch<Project>(`/api/projects/${id}`, 'PATCH', payload);

export const deleteProject = (id: string) => 
  apiFetch<void>(`/api/projects/${id}`, 'DELETE');
