'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import AddMemberModal from './AddMemberModal';
import { updateTask } from '@/lib/models/puters/tasks';
import { deleteTask } from '@/lib/models/deleters/tasks';
import { deleteProject } from '@/lib/models/deleters/projects';
import type { Project, Task } from '@/lib/models/geters/projects';

interface ProjectDetailContentProps {
  project: Project;
  userId: string;
}

export default function ProjectDetailContent({ project: initialProject, userId }: ProjectDetailContentProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await updateTask(taskId, { status });
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
      }));
      router.refresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [router]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId),
      }));
      router.refresh();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [router]);

  const handleDeleteProject = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this project? This will delete all tasks.')) return;
    
    try {
      await deleteProject(project.id);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, [project.id, router]);

  const handleTaskCreated = useCallback(() => {
    router.refresh();
    setShowTaskModal(false);
  }, [router]);

  const handleMemberAdded = useCallback(() => {
    router.refresh();
    setShowMemberModal(false);
  }, [router]);

  const isOwner = useMemo(() => project.ownerId === userId, [project.ownerId, userId]);

  const tasksByStatus = useMemo(() => {
    return {
      TODO: project.tasks.filter((t) => t.status === 'TODO'),
      IN_PROGRESS: project.tasks.filter((t) => t.status === 'IN_PROGRESS'),
      DONE: project.tasks.filter((t) => t.status === 'DONE'),
    };
  }, [project.tasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 inline-flex items-center"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
          {isOwner && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
            >
              + Add Member
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {project.owner.name?.[0] || project.owner.email[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {project.owner.name || project.owner.email}
              </div>
              <div className="text-xs text-gray-500">Owner</div>
            </div>
          </div>
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {member.user.name?.[0] || member.user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {member.user.name || member.user.email}
                </div>
                <div className="text-xs text-gray-500">Member</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            + New Task
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TODO Column */}
          <div>
            <div className="bg-gray-100 rounded-t-lg px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">
                TODO ({tasksByStatus.TODO.length})
              </h3>
            </div>
            <div className="bg-gray-50 rounded-b-lg p-4 min-h-[400px] space-y-3">
              {tasksByStatus.TODO.map((task) => (
                <div key={task.id} className="relative">
                  <TaskCard
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate}
                    assignee={task.assignee}
                    project={project}
                    onStatusChange={handleTaskStatusChange}
                  />
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* IN PROGRESS Column */}
          <div>
            <div className="bg-blue-100 rounded-t-lg px-4 py-2 border-b border-blue-200">
              <h3 className="font-semibold text-blue-700">
                IN PROGRESS ({tasksByStatus.IN_PROGRESS.length})
              </h3>
            </div>
            <div className="bg-blue-50 rounded-b-lg p-4 min-h-[400px] space-y-3">
              {tasksByStatus.IN_PROGRESS.map((task) => (
                <div key={task.id} className="relative">
                  <TaskCard
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate}
                    assignee={task.assignee}
                    project={project}
                    onStatusChange={handleTaskStatusChange}
                  />
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DONE Column */}
          <div>
            <div className="bg-green-100 rounded-t-lg px-4 py-2 border-b border-green-200">
              <h3 className="font-semibold text-green-700">
                DONE ({tasksByStatus.DONE.length})
              </h3>
            </div>
            <div className="bg-green-50 rounded-b-lg p-4 min-h-[400px] space-y-3">
              {tasksByStatus.DONE.map((task) => (
                <div key={task.id} className="relative">
                  <TaskCard
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate}
                    assignee={task.assignee}
                    project={project}
                    onStatusChange={handleTaskStatusChange}
                  />
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <CreateTaskModal
          projects={[project]}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={project.id}
          existingMembers={project.members.map((m) => m.userId)}
          onClose={() => setShowMemberModal(false)}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
}
