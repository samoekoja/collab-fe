export interface Project {
  _id: { $oid: string } | string;
  org_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
}
