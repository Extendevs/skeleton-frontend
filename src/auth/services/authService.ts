import { apiClient } from '../../core/api/apiClient';
import { AuthTokens, SessionProfile, SessionUser } from '../../types/Session';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginRawResponse {
  data: {
    user: SessionUser;
    abilities?: string[];
    roles?: string[];
    access_token?: string;
  };
  [key: string]: unknown;
}

const AUTH_LOGIN_PATH = '/auth/login';
const AUTH_ME_PATH = '/auth/me';

const toSessionProfile = (data: LoginRawResponse): SessionProfile => {
  const rawUser = data?.user as (SessionUser & { full_name?: string | null }) | undefined;
  if (!rawUser) {
    throw new Error('Missing user data in session response');
  }

  const fullName = typeof rawUser.full_name === 'string' ? rawUser.full_name : null;
  const resolvedName = fullName && fullName.trim().length > 0 ? fullName.trim() : rawUser.name;

  const user: SessionUser = {
    ...rawUser,
    email: rawUser.email,
    name: resolvedName
  };

  return {
    user,
    abilities: Array.isArray(data.abilities) ? (data.abilities as string[]) : [],
    roles: Array.isArray(data.roles) ? (data.roles as string[]) : [],
    company: (data as { company?: Record<string, unknown> | null }).company ?? null,
    country: (data as { country?: Record<string, unknown> | null }).country ?? null,
    raw: data
  };
};

export interface LoginResponse {
  profile: SessionProfile;
  tokens: AuthTokens;
}

export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginRawResponse>(AUTH_LOGIN_PATH, credentials);
  const data = response.data?.data;
  const profile = toSessionProfile(data as unknown as LoginRawResponse);
  const accessToken = typeof data.access_token === 'string' && data.access_token.length > 0 ? data.access_token : null;
  if (!accessToken) {
    throw new Error('Missing access token in login response');
  }
  const tokens: AuthTokens = {
    accessToken
  };
  return { profile, tokens };
};

export const fetchSessionProfile = async (): Promise<SessionProfile> => {
  const response = await apiClient.get<LoginRawResponse>(AUTH_ME_PATH);
  const data = response.data?.data;
  return toSessionProfile(data as unknown as LoginRawResponse);
};
