'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createTask } from '@/lib/models/posters/tasks';
import type { Project } from '@/lib/models/geters/projects';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface CreateTaskModalProps {
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({ projects, onClose, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects.length === 1 ? projects[0].id : '');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available assignees from selected project members + owner
  const availableAssignees = useMemo(() => {
    if (!projectId) return [];
    const project = projects.find(p => p.id === projectId);
    if (!project) return [];
    
    const assignees: User[] = [];
    // Add owner
    if (project.owner) {
      assignees.push({
        id: project.owner.id,
        email: project.owner.email,
        name: project.owner.name,
      });
    }
    // Add members
    if (project.members) {
      project.members.forEach(m => {
        if (m.user && !assignees.find(a => a.id === m.user.id)) {
          assignees.push({
            id: m.user.id,
            email: m.user.email,
            name: m.user.name,
          });
        }
      });
    }
    return assignees;
  }, [projectId, projects]);

  // Reset assignee when project changes
  useEffect(() => {
    setAssigneeId('');
  }, [projectId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (!projectId) {
      setError('Please select a project');
      return;
    }
    
    setLoading(true);

    try {
      const result = await createTask({
        title: title.trim(),
        description: description?.trim() || undefined,
        projectId,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      
      if (result) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Create task error:', err);
      let errorMessage = 'Failed to create task. Please try again.';
      if (err.response) {
        const serverError = err.response.data?.error || err.response.data?.message;
        if (serverError) errorMessage = serverError;
        else if (err.response.status === 401) errorMessage = 'You are not authorized. Please log in again.';
        else if (err.response.status === 404) errorMessage = 'Project not found.';
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [title, description, projectId, priority, dueDate, assigneeId, onSuccess]);

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { value: 'HIGH', label: 'High', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-modal-overlay overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-modal-slide-up my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 flex items-center space-x-2 text-sm animate-fade-in">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 font-medium"
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          {projects.length > 0 && (
            <div>
              <label htmlFor="project" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 appearance-none cursor-pointer font-medium"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Priority
              </label>
              <div className="flex space-x-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 border-2 ${
                      priority === opt.value
                        ? `${opt.bg} ${opt.color} border-current`
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Assignee Selection */}
          {projectId && availableAssignees.length > 0 && (
            <div>
              <label htmlFor="assignee" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Assign To <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 appearance-none cursor-pointer font-medium"
              >
                <option value="">Unassigned</option>
                {availableAssignees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !projectId}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
