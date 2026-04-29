import apiClient from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch {
    return null;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch {
    return null;
  }
}
