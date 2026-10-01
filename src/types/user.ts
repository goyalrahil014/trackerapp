export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
