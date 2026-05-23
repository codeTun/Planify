import apiClient from '@/lib/api-client-client';

export interface SignupData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
}
