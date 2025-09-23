export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface SessionProfile {
  user: SessionUser;
  abilities: string[];
  roles: string[];
  company?: Record<string, unknown> | null;
  country?: Record<string, unknown> | null;
  raw?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}
