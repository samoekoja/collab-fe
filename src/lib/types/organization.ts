export interface Organization {
  _id: { $oid: string } | string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface OrgMembership {
  _id: { $oid: string } | string;
  org_id: string;
  user_id: string;
  org_role: string; // "owner" | "admin" | "member"
  joined_at: string;
}

export interface EnrichedMember extends OrgMembership {
  user_name: string;
  user_email: string;
  user_status: string; // "active" | "inactive"
}

export interface Invitation {
  _id: { $oid: string } | string;
  org_id: string;
  email: string;
  invited_by: string;
  status: string; // "pending" | "accepted" | "expired"
  token: string;
  created_at: string;
  expires_at: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
}

export interface InviteMemberPayload {
  email: string;
}

export interface UpdateMemberRolePayload {
  role: string; // "admin" | "member"
}
