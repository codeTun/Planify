import apiClient from '@/lib/api-client-client';

export interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export async function createTask(data: CreateTaskData): Promise<Task> {
  const response = await apiClient.post('/tasks', data);
  return response.data;
}
