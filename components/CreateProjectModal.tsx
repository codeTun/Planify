'use client';

import { useState, useCallback, useEffect } from 'react';
import { createProject } from '@/lib/models/posters/projects';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    
    setLoading(true);

    try {
      const result = await createProject({
        name: name.trim(),
        description: description?.trim() || undefined,
        memberIds: selectedUserIds,
      });
      
      if (result) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Create project error:', err);
      let errorMessage = 'Failed to create project. Please try again.';
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [name, description, selectedUserIds, onSuccess]);

  const handleUserToggle = useCallback((userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-modal-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Project</h2>
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
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 font-medium"
              placeholder="My Awesome Project"
              autoFocus
            />
          </div>

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
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Team Members <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            {fetchingUsers ? (
              <div className="flex items-center justify-center py-6">
                <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">No other users available</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-xl p-2 space-y-1 bg-gray-50 dark:bg-gray-950">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      selectedUserIds.includes(user.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {(user.name || user.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {user.name || user.email}
                        </div>
                        {user.name && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedUserIds.length > 0 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                {selectedUserIds.length} member{selectedUserIds.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

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
              disabled={loading || !name.trim()}
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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
