'use client';

import Link from 'next/link';
import { useMemo } from 'react';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  memberCount: number;
  index?: number;
}

export default function ProjectCard({ id, name, description, taskCount, memberCount, index = 0 }: ProjectCardProps) {
  const truncatedDescription = useMemo(
    () => (description && description.length > 100 ? `${description.substring(0, 100)}...` : description),
    [description]
  );

  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-indigo-500 to-blue-500',
    'from-rose-500 to-red-500',
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <Link href={`/dashboard/projects/${id}`} className="block group">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover-lift cursor-pointer">
        {/* Gradient accent bar */}
        <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {name[0]?.toUpperCase()}
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          {truncatedDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{truncatedDescription}</p>
          )}
          {!truncatedDescription && <div className="mb-4" />}

          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">{taskCount} tasks</span>
            </span>
            <span className="flex items-center space-x-1.5 text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">{memberCount} members</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
