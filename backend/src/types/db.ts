export interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  is_verified: boolean;
  is_active: boolean;
  role: string;
  reset_token_hash?: string | null;
  reset_token_expires_at?: string | null;
  verification_token?: string | null;
}

export interface ProjectRow {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
}

export interface ProjectMemberRow {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
}


