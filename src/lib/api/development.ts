import { apiFetch } from './client';
import type { 
  Feature, CreateFeaturePayload, UpdateFeaturePayload,
  Task, CreateTaskPayload, UpdateTaskPayload
} from '../types/development';

// Features
export const listFeatures = (projectId: string) => 
  apiFetch<Feature[]>(`/api/projects/${projectId}/development/features`);

export const getFeature = (projectId: string, featureId: string) => 
  apiFetch<Feature>(`/api/projects/${projectId}/development/features/${featureId}`);

export const createFeature = (projectId: string, payload: CreateFeaturePayload) => 
  apiFetch<Feature>(`/api/projects/${projectId}/development/features`, 'POST', payload);

export const updateFeature = (projectId: string, featureId: string, payload: UpdateFeaturePayload) => 
  apiFetch<Feature>(`/api/projects/${projectId}/development/features/${featureId}`, 'PATCH', payload);

export const deleteFeature = (projectId: string, featureId: string) => 
  apiFetch<void>(`/api/projects/${projectId}/development/features/${featureId}`, 'DELETE');

// Tasks
export const listTasks = (projectId: string, featureId: string) => 
  apiFetch<Task[]>(`/api/projects/${projectId}/development/features/${featureId}/tasks`);

export const getTask = (projectId: string, featureId: string, taskId: string) => 
  apiFetch<Task>(`/api/projects/${projectId}/development/features/${featureId}/tasks/${taskId}`);

export const createTask = (projectId: string, featureId: string, payload: CreateTaskPayload) => 
  apiFetch<Task>(`/api/projects/${projectId}/development/features/${featureId}/tasks`, 'POST', payload);

export const updateTask = (projectId: string, featureId: string, taskId: string, payload: UpdateTaskPayload) => 
  apiFetch<Task>(`/api/projects/${projectId}/development/features/${featureId}/tasks/${taskId}`, 'PATCH', payload);

export const deleteTask = (projectId: string, featureId: string, taskId: string) => 
  apiFetch<void>(`/api/projects/${projectId}/development/features/${featureId}/tasks/${taskId}`, 'DELETE');
