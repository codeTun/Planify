import apiClient from '@/lib/api-client';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
  tasks: Task[];
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  assignee: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'OWNER' | 'MEMBER';
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get('/projects');
    return response.data;
  } catch {
    return [];
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  try {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  } catch {
    return null;
  }
}

export async function getUserProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get('/projects/my-projects');
    return response.data;
  } catch {
    return [];
  }
}
