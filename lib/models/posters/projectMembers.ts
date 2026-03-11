import apiClient from '@/lib/api-client-client';

export interface AddMemberData {
  projectId: string;
  userId: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'OWNER' | 'MEMBER';
  createdAt: string;
}

export async function addProjectMember(data: AddMemberData): Promise<ProjectMember> {
  const response = await apiClient.post('/projects/members', data);
  return response.data;
}
