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
  const priorityConfig = useMemo(
    () => ({
      LOW: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
      MEDIUM: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
      HIGH: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    }),
    []
  );

  const statusConfig = useMemo(
    () => ({
      TODO: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
      IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      DONE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    }),
    []
  );

  const formattedDate = useMemo(() => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, [dueDate]);

  const isOverdue = useMemo(() => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'DONE';
  }, [dueDate, status]);

  const pConfig = priorityConfig[priority];
  const sConfig = statusConfig[status];

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover-lift transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <h4 className="font-bold text-gray-900 dark:text-white flex-1 leading-tight text-sm">{title}</h4>
        <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${pConfig.bg} ${pConfig.text} ml-2 shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
          <span>{priority}</span>
        </span>
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{description}</p>
      )}
      
      {/* Status & Date */}
      <div className="flex items-center justify-between mb-3">
        <select
          value={status}
          onChange={(e) => onStatusChange?.(id, e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${sConfig.bg} ${sConfig.text} ${sConfig.border} cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors`}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        {formattedDate && (
          <span className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate max-w-[50%]">{project.name}</span>
        {assignee && (
          <div className="flex items-center space-x-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">
                {(assignee.name || assignee.email)[0].toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[80px]">
              {assignee.name || assignee.email.split('@')[0]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
