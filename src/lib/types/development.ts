import type { Assignee, Origin } from './research';

export interface Feature {
  _id: { $oid: string } | string;
  project_id: string;
  title: string;
  description: string;
  requirements: string[];
  prd?: string;
  research_links: string[];
  lifecycle_stage: string;
  priority: string;
  origin?: Origin;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  _id: { $oid: string } | string;
  feature_id: string;
  project_id: string;
  title: string;
  description: string;
  task_info?: string;
  assignees: Assignee[];
  status: string;
  created_by: string;
  created_at: string;
}

export interface CreateFeaturePayload {
  title: string;
  description: string;
  requirements?: string[];
  prd?: string;
  priority?: string;
  research_links?: string[];
}

export interface UpdateFeaturePayload {
  title?: string;
  description?: string;
  requirements?: string[];
  prd?: string;
  priority?: string;
  lifecycle_stage?: string;
  research_links?: string[];
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  task_info?: string;
  assignees?: Assignee[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  task_info?: string;
  status?: string;
  assignees?: Assignee[];
}
