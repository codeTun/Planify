import apiClient from '@/lib/api-client';

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

export async function getAllTasks(): Promise<Task[]> {
  try {
    const response = await apiClient.get('/tasks');
    return response.data;
  } catch {
    return [];
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  } catch {
    return null;
  }
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    const response = await apiClient.get(`/tasks?projectId=${projectId}`);
    return response.data;
  } catch {
    return [];
  }
}

export async function getUserTasks(): Promise<Task[]> {
  try {
    const response = await apiClient.get('/tasks/my-tasks');
    return response.data;
  } catch {
    return [];
  }
}
