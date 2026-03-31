import { apiFetch } from './client';
import type { 
  ResearchGroup, CreateResearchGroupPayload, UpdateResearchGroupPayload,
  ResearchTopic, CreateResearchTopicPayload, UpdateResearchTopicPayload 
} from '../types/research';

// Groups
export const listGroups = (projectId: string) => 
  apiFetch<ResearchGroup[]>(`/api/projects/${projectId}/research/groups`);

export const getGroup = (projectId: string, groupId: string) => 
  apiFetch<ResearchGroup>(`/api/projects/${projectId}/research/groups/${groupId}`);

export const createGroup = (projectId: string, payload: CreateResearchGroupPayload) => 
  apiFetch<ResearchGroup>(`/api/projects/${projectId}/research/groups`, 'POST', payload);

export const updateGroup = (projectId: string, groupId: string, payload: UpdateResearchGroupPayload) => 
  apiFetch<ResearchGroup>(`/api/projects/${projectId}/research/groups/${groupId}`, 'PATCH', payload);

export const deleteGroup = (projectId: string, groupId: string) => 
  apiFetch<void>(`/api/projects/${projectId}/research/groups/${groupId}`, 'DELETE');

// Topics
export const listTopics = (projectId: string, groupId: string) => 
  apiFetch<ResearchTopic[]>(`/api/projects/${projectId}/research/groups/${groupId}/topics`);

export const getTopic = (projectId: string, groupId: string, topicId: string) => 
  apiFetch<ResearchTopic>(`/api/projects/${projectId}/research/groups/${groupId}/topics/${topicId}`);

export const createTopic = (projectId: string, groupId: string, payload: CreateResearchTopicPayload) => 
  apiFetch<ResearchTopic>(`/api/projects/${projectId}/research/groups/${groupId}/topics`, 'POST', payload);

export const updateTopic = (projectId: string, groupId: string, topicId: string, payload: UpdateResearchTopicPayload) => 
  apiFetch<ResearchTopic>(`/api/projects/${projectId}/research/groups/${groupId}/topics/${topicId}`, 'PATCH', payload);

export const deleteTopic = (projectId: string, groupId: string, topicId: string) => 
  apiFetch<void>(`/api/projects/${projectId}/research/groups/${groupId}/topics/${topicId}`, 'DELETE');
