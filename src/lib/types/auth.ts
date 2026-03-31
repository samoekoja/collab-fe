export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}

export interface AuthResponse {
  token: string;
  must_change_password: boolean;
}
