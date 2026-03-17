'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProjectCard from './ProjectCard';
import TaskCard from './TaskCard';
import CreateProjectModal from './CreateProjectModal';
import CreateTaskModal from './CreateTaskModal';
import AddMemberModal from './AddMemberModal';
import { updateTask } from '@/lib/models/puters/tasks';
import type { Project, Task } from '@/lib/models/geters/projects';

interface DashboardContentProps {
  initialProjects: Project[];
  initialTasks: Task[];
  userId: string;
  userName: string;
}

export default function DashboardContent({ initialProjects, initialTasks, userId, userName }: DashboardContentProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');

  const handleTaskStatusChange = useCallback(async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
    try {
      await updateTask(taskId, { status });
      router.refresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: initialTasks.find(t => t.id === taskId)?.status || task.status } : task))
      );
    }
  }, [router, initialTasks]);

  const refreshData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects/my-projects', { credentials: 'include' }),
        fetch('/api/tasks', { credentials: 'include' }),
      ]);
      if (projectsRes.ok) {
        const newProjects = await projectsRes.json();
        setProjects(newProjects);
      }
      if (tasksRes.ok) {
        const newTasks = await tasksRes.json();
        setTasks(newTasks);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, []);

  const handleProjectCreated = useCallback(async () => {
    setShowProjectModal(false);
    router.refresh();
    await refreshData();
  }, [router, refreshData]);

  const handleTaskCreated = useCallback(async () => {
    setShowTaskModal(false);
    router.refresh();
    await refreshData();
  }, [router, refreshData]);

  const handleMemberAdded = useCallback(async () => {
    setShowMemberModal(false);
    setSelectedProjectId(null);
    router.refresh();
    await refreshData();
  }, [router, refreshData]);

  const handleAddMember = useCallback((projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setShowMemberModal(true);
  }, []);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = tasks.filter((t) => t.status === 'TODO').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { totalProjects, totalTasks, completedTasks, inProgressTasks, todoTasks, completionRate };
  }, [projects, tasks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Welcome back, <span className="gradient-text">{userName}</span>! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Here&apos;s an overview of your projects and tasks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {[
          {
            label: 'Projects',
            value: stats.totalProjects,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            ),
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
          },
          {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
            gradient: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
          },
          {
            label: 'In Progress',
            value: stats.inProgressTasks,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: 'from-amber-500 to-orange-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: 'Completed',
            value: stats.completedTasks,
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
            iconColor: 'text-green-600 dark:text-green-400',
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover-lift`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-0.5 animate-count-up" style={{ animationDelay: `${i * 100 + 200}ms` }}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {stats.totalTasks > 0 && (
        <div className="mb-10 animate-fade-in-up delay-400">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Overall Progress</h3>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.completionRate}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress transition-all duration-700"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span>To Do: {stats.todoTasks}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>In Progress: {stats.inProgressTasks}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Done: {stats.completedTasks}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit animate-fade-in-up delay-500">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'projects'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'tasks'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Tasks ({tasks.length})
        </button>
      </div>

      {/* Projects Section */}
      {activeTab === 'projects' && (
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Projects</h2>
            <button
              onClick={() => setShowProjectModal(true)}
              className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first project to get started!</p>
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, index) => (
                <div key={project.id} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    description={project.description}
                    taskCount={project.tasks.length}
                    memberCount={project.members.length}
                    index={index}
                  />
                  {project.ownerId === userId && (
                    <button
                      onClick={(e) => handleAddMember(project.id, e)}
                      className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg z-10 hover:scale-105"
                      title="Add member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Section */}
      {activeTab === 'tasks' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Tasks</h2>
            <button
              onClick={() => setShowTaskModal(true)}
              className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
          
          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first task to start tracking progress!</p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <TaskCard
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    dueDate={task.dueDate}
                    assignee={task.assignee}
                    project={task.project}
                    onStatusChange={handleTaskStatusChange}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}

      {showTaskModal && (
        <CreateTaskModal
          projects={projects}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {showMemberModal && selectedProjectId && (
        <AddMemberModal
          projectId={selectedProjectId}
          existingMembers={
            projects.find(p => p.id === selectedProjectId)?.members.map(m => m.userId) || []
          }
          onClose={() => {
            setShowMemberModal(false);
            setSelectedProjectId(null);
          }}
          onSuccess={handleMemberAdded}
        />
      )}
    </div>
  );
}
