import { apiFetch } from './client';
import type {
  Organization,
  OrgMembership,
  EnrichedMember,
  Invitation,
  UpdateOrganizationPayload,
  InviteMemberPayload,
  UpdateMemberRolePayload
} from '../types/organization';

// ── Organizations ──

export const listOrganizations = () =>
  apiFetch<Organization[]>('/api/organizations');

export const getOrganization = (id: string) =>
  apiFetch<Organization>(`/api/organizations/${id}`);

export const updateOrganization = (id: string, payload: UpdateOrganizationPayload) =>
  apiFetch<Organization>(`/api/organizations/${id}`, 'PATCH', payload);

export const deleteOrganization = (id: string) =>
  apiFetch<void>(`/api/organizations/${id}`, 'DELETE');

// ── Organization Members ──

export const listOrgMembers = (orgId: string) =>
  apiFetch<EnrichedMember[]>(`/api/organizations/${orgId}/members`);

export const inviteMember = (orgId: string, payload: InviteMemberPayload) =>
  apiFetch<OrgMembership>(`/api/organizations/${orgId}/members/invite`, 'POST', payload);

export const updateOrgMemberRole = (orgId: string, userId: string, payload: UpdateMemberRolePayload) =>
  apiFetch<OrgMembership>(`/api/organizations/${orgId}/members/${userId}`, 'PATCH', payload);

export const removeOrgMember = (orgId: string, userId: string) =>
  apiFetch<void>(`/api/organizations/${orgId}/members/${userId}`, 'DELETE');
