'use client';

import { useMemo } from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  assignee: { name: string | null; email: string } | null;
  project: { name: string };
  onStatusChange?: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  assignee,
  project,
  onStatusChange,
}: TaskCardProps) {
  const priorityColors = useMemo(
    () => ({
      LOW: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      HIGH: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      TODO: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      DONE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    }),
    []
  );

  const formattedDate = useMemo(() => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    // Use a consistent format that works the same on server and client
    // Format: DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, [dueDate]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 dark:text-white flex-1">{title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[priority]}`}>
          {priority}
        </span>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            value={status}
            onChange={(e) => onStatusChange?.(id, e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
            className={`px-2 py-1 rounded text-xs font-medium border-0 ${statusColors[status]} cursor-pointer`}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          {formattedDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Due: {formattedDate}</span>
          )}
        </div>
        {assignee && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{assignee.name || assignee.email}</span>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">{project.name}</div>
    </div>
  );
}
