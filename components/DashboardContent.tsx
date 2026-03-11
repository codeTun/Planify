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

  const handleTaskStatusChange = useCallback(async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await updateTask(taskId, { status });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status } : task))
      );
      router.refresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [router]);

  const handleProjectCreated = useCallback(async () => {
    setShowProjectModal(false);
    // Refresh data from server
    router.refresh();
    // Also update local state optimistically
    try {
      const response = await fetch('/api/projects/my-projects');
      if (response.ok) {
        const newProjects = await response.json();
        setProjects(newProjects);
      }
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    }
  }, [router]);

  const handleTaskCreated = useCallback(async () => {
    setShowTaskModal(false);
    // Refresh data from server
    router.refresh();
    // Also update local state optimistically
    try {
      const response = await fetch('/api/tasks/my-tasks');
      if (response.ok) {
        const newTasks = await response.json();
        setTasks(newTasks);
      }
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  }, [router]);

  const handleMemberAdded = useCallback(async () => {
    setShowMemberModal(false);
    setSelectedProjectId(null);
    // Refresh data from server
    router.refresh();
    // Also update local state optimistically
    try {
      const response = await fetch('/api/projects/my-projects');
      if (response.ok) {
        const newProjects = await response.json();
        setProjects(newProjects);
      }
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    }
  }, [router]);

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
    
    return {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
    };
  }, [projects, tasks]);

  // Get recent activity (recently created/updated tasks and projects)
  const recentActivity = useMemo(() => {
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return { recentTasks, recentProjects };
  }, [tasks, projects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userName.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your projects and tasks
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Projects</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tasks</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgressTasks}</div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">In Progress</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedTasks}</div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {(recentActivity.recentTasks.length > 0 || recentActivity.recentProjects.length > 0) && (
        <div className="mb-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentActivity.recentProjects.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Projects</h3>
                <div className="space-y-2">
                  {recentActivity.recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recentActivity.recentTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Tasks</h3>
                <div className="space-y-2">
                  {recentActivity.recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'DONE' ? 'bg-green-500' : 
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h2>
          <button
            onClick={() => setShowProjectModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet. Create your first project!</p>
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <ProjectCard
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  taskCount={project.tasks.length}
                  memberCount={project.members.length}
                />
                {project.ownerId === userId && (
                  <button
                    onClick={(e) => handleAddMember(project.id, e)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md z-10"
                    title="Add member"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h2>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </button>
        </div>
        
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks yet. Create your first task!</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
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
            ))}
          </div>
        )}
      </div>

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
