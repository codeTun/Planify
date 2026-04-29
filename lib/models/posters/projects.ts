import apiClient from '@/lib/api-client-client';

export interface CreateProjectData {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  const response = await apiClient.post('/projects', data);
  return response.data;
}
