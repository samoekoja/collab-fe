export interface ClientRequest {
  _id?: string;
  project_id: string;
  client_name: string;
  title: string;
  description: string;
  demand_level: string;
  status: string;
  linked_topic_id?: string;
  linked_feature_id?: string;
  created_at: string;
}

export interface CreateClientRequestPayload {
  client_name: string;
  title: string;
  description: string;
  demand_level?: string;
}

export interface UpdateClientRequestPayload {
  client_name?: string;
  title?: string;
  description?: string;
  status?: string;
  demand_level?: string;
  linked_topic_id?: string;
  linked_feature_id?: string;
}
