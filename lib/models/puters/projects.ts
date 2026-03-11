import apiClient from '@/lib/api-client';

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
  const response = await apiClient.put(`/projects/${projectId}`, data);
  return response.data;
}
