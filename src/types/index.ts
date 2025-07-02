export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  email: string;
  code: string;
}

export interface Link {
  id: string;
  user_id: string;
  url: string;
  platform: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
}
