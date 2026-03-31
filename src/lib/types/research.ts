export interface Material {
  name: string;
  url: string;
  material_type: string;
  added_by: string;
  added_at: string;
}

export interface Assignee {
  user_id: string;
  assigned_at: string;
}

export interface Origin {
  source_type: string;
  source_id: string;
}

export interface ResearchGroup {
  _id: { $oid: string } | string;
  project_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  status: string;
}

export interface ResearchTopic {
  _id: { $oid: string } | string;
  group_id: string;
  project_id: string;
  issue_number: number;
  title: string;
  description: string;
  assignees: Assignee[];
  status: string;
  origin?: Origin;
  materials: Material[];
  created_by: string;
  created_at: string;
}

export interface CreateResearchGroupPayload {
  name: string;
  description: string;
}

export interface UpdateResearchGroupPayload {
  name?: string;
  description?: string;
  status?: string;
}

export interface CreateResearchTopicPayload {
  title: string;
  description: string;
  assignees?: Assignee[];
  status?: string;
  origin?: Origin;
}

export interface UpdateResearchTopicPayload {
  title?: string;
  description?: string;
  status?: string;
  assignees?: Assignee[];
  origin?: Origin;
}
