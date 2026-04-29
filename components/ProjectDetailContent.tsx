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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleTaskStatusChange = useCallback(async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    }));
    try {
      await updateTask(taskId, { status });
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
    try {
      await deleteProject(project.id);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, [project.id, router]);

  const handleTaskCreated = useCallback(async () => {
    setShowTaskModal(false);
    router.refresh();
    // Refresh project data
    try {
      const res = await fetch(`/api/projects/${project.id}`, { credentials: 'include' });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    } catch (e) {
      console.error('Failed to refresh project:', e);
    }
  }, [router, project.id]);

  const handleMemberAdded = useCallback(async () => {
    setShowMemberModal(false);
    router.refresh();
    try {
      const res = await fetch(`/api/projects/${project.id}`, { credentials: 'include' });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    } catch (e) {
      console.error('Failed to refresh project:', e);
    }
  }, [router, project.id]);

  const isOwner = useMemo(() => project.ownerId === userId, [project.ownerId, userId]);

  const tasksByStatus = useMemo(() => ({
    TODO: project.tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: project.tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: project.tasks.filter((t) => t.status === 'DONE'),
  }), [project.tasks]);

  const completionRate = useMemo(() => {
    if (project.tasks.length === 0) return 0;
    return Math.round((tasksByStatus.DONE.length / project.tasks.length) * 100);
  }, [project.tasks.length, tasksByStatus.DONE.length]);

  const kanbanColumns = [
    {
      key: 'TODO' as const,
      label: 'To Do',
      tasks: tasksByStatus.TODO,
      headerBg: 'bg-gray-100 dark:bg-gray-800',
      headerText: 'text-gray-700 dark:text-gray-300',
      columnBg: 'bg-gray-50/50 dark:bg-gray-900/50',
      dotColor: 'bg-gray-400',
    },
    {
      key: 'IN_PROGRESS' as const,
      label: 'In Progress',
      tasks: tasksByStatus.IN_PROGRESS,
      headerBg: 'bg-blue-50 dark:bg-blue-900/20',
      headerText: 'text-blue-700 dark:text-blue-400',
      columnBg: 'bg-blue-50/30 dark:bg-blue-900/10',
      dotColor: 'bg-blue-500',
    },
    {
      key: 'DONE' as const,
      label: 'Done',
      tasks: tasksByStatus.DONE,
      headerBg: 'bg-green-50 dark:bg-green-900/20',
      headerText: 'text-green-700 dark:text-green-400',
      columnBg: 'bg-green-50/30 dark:bg-green-900/10',
      dotColor: 'bg-green-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <Link
          href="/dashboard"
          className="group inline-flex items-center space-x-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5 transition-colors"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">{project.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setShowTaskModal(true)}
              className="group px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2 text-sm"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
            {isOwner && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-semibold transition-all duration-200 text-sm border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{project.tasks.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Tasks</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{tasksByStatus.IN_PROGRESS.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-extrabold text-green-600 dark:text-green-400">{tasksByStatus.DONE.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <div className="text-2xl font-extrabold gradient-text">{completionRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Progress</div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8 animate-fade-in-up delay-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Members</h2>
          {isOwner && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="group flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add Member</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Owner */}
          <div className="flex items-center space-x-2.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {project.owner.name?.[0]?.toUpperCase() || project.owner.email[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {project.owner.name || project.owner.email}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Owner</div>
            </div>
          </div>
          {/* Members */}
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center space-x-2.5 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {member.user.name || member.user.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="mb-6 animate-fade-in-up delay-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Task Board</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map((col) => (
            <div key={col.key} className="flex flex-col">
              {/* Column Header */}
              <div className={`${col.headerBg} rounded-t-xl px-4 py-3 border border-b-0 border-gray-200 dark:border-gray-800`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className={`font-bold text-sm ${col.headerText}`}>
                      {col.label}
                    </h3>
                  </div>
                  <span className={`text-xs font-bold ${col.headerText} bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full`}>
                    {col.tasks.length}
                  </span>
                </div>
              </div>
              
              {/* Column Body */}
              <div className={`${col.columnBg} rounded-b-xl p-3 border border-t-0 border-gray-200 dark:border-gray-800 kanban-column space-y-3 flex-1`}>
                {col.tasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
                    No tasks
                  </div>
                ) : (
                  col.tasks.map((task, index) => (
                    <div key={task.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
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
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm hover:scale-105"
                          title="Delete task"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-modal-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">This will permanently delete the project and all its tasks. This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteProject} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
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
