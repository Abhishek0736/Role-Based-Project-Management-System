import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  FileText, 
  Tag,
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';
import axios from 'axios';

const ProjectModal = ({ isOpen, onClose, onSave, projectToEdit = null }) => {
  const [userRole] = useState(localStorage.getItem('userRole') || 'employee');
  
  // Block employees from accessing project modal
  useEffect(() => {
    if (isOpen && userRole === 'employee') {
      alert('Access Denied: Employees cannot create or edit projects');
      onClose();
      return;
    }
  }, [isOpen, userRole, onClose]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: {
      allocated: 0,
      spent: 0
    },
    tags: [],
    team: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (projectToEdit) {
        setFormData({
          ...projectToEdit,
          startDate: new Date(projectToEdit.startDate).toISOString().split('T')[0],
          endDate: new Date(projectToEdit.endDate).toISOString().split('T')[0],
          budget: projectToEdit.budget || { allocated: 0, spent: 0 },
          tags: projectToEdit.tags || [],
          team: projectToEdit.team || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'planning',
          priority: 'Medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          budget: {
            allocated: 0,
            spent: 0
          },
          tags: [],
          team: []
        });
      }
      setErrors({});
    }
  }, [isOpen, projectToEdit]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTeamMember = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user && !formData.team.find(member => member.user === userId)) {
      setFormData(prev => ({
        ...prev,
        team: [...prev.team, { user: userId, role: 'developer' }]
      }));
    }
  };

  const removeTeamMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(member => member.user !== userId)
    }));
  };

  const updateTeamMemberRole = (userId, role) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.map(member => 
        member.user === userId ? { ...member, role } : member
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget.allocated < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors({ submit: 'Failed to save project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {projectToEdit ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Describe your project..."
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="budget.allocated"
                  value={formData.budget.allocated}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Allocated budget"
                />
              </div>
              {projectToEdit && (
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="budget.spent"
                    value={formData.budget.spent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Spent budget"
                  />
                </div>
              )}
            </div>
            {errors.budget && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.budget}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="space-y-3">
              {formData.team.map((member) => {
                const user = users.find(u => u._id === member.user);
                return (
                  <div key={member.user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMemberRole(member.user, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="manager">Manager</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="tester">Tester</option>
                        <option value="analyst">Analyst</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.user)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addTeamMember(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Add team member...</option>
                {users
                  .filter(user => !formData.team.find(member => member.user === user._id))
                  .map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : (projectToEdit ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;