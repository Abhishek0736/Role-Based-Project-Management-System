


import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  MoreVertical,
  FolderOpen,
  Target,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/user/all', { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Add selected team members to project data
      const projectWithTeam = {
        ...projectData,
        team: selectedMembers.map(memberId => ({
          user: memberId,
          role: 'developer'
        })),
        members: selectedMembers // For easier querying
      };
      
      const response = await axios.post('http://localhost:3000/api/projects', projectWithTeam, { headers });
      
      if (response.data) {
        fetchProjects();
        setShowCreateModal(false);
        setSelectedMembers([]);
        toast.success('Project created successfully!');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMsg);
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await axios.put(`http://localhost:3000/api/projects/${editingProject._id}`, projectData, { headers });
      
      if (response.data) {
        fetchProjects();
        setShowEditModal(false);
        setEditingProject(null);
        toast.success('Project updated successfully!');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update project';
      toast.error(errorMsg);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        await axios.delete(`http://localhost:3000/api/projects/${projectId}`, { headers });
        fetchProjects();
        toast.success('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        const errorMsg = error.response?.data?.message || 'Failed to delete project';
        toast.error(errorMsg);
      }
    }
  };

  const handleUpdateProgress = async (projectId, newProgress) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await axios.put(`http://localhost:3000/api/projects/${projectId}`, { progress: newProgress }, { headers });
      fetchProjects();
      toast.success('Progress updated!');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await axios.put(`http://localhost:3000/api/projects/${projectId}`, { status: newStatus }, { headers });
      fetchProjects();
      toast.success('Status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMemberToProject = async (projectId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      await axios.post(`http://localhost:3000/api/projects/${projectId}/team`, {
        userId,
        role: 'developer'
      }, { headers });
      fetchProjects(); // Refresh projects
    } catch (error) {
      console.error('Error adding member to project:', error);
      alert('Failed to add member to project');
    }
  };

  const handleRemoveMemberFromProject = async (projectId, userId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.delete(`http://localhost:3000/api/projects/${projectId}/team/${userId}`, { headers });
      fetchProjects(); // Refresh projects
    } catch (error) {
      console.error('Error removing member from project:', error);
      alert('Failed to remove member from project');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchUsers();
    // A real app should get the user role from a context or a fetch call
    const role = localStorage.getItem('userRole'); 
    if (!role) {
      // fetch user details and set role
      // for now, we assume it's in localStorage
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/projects', { headers });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/tasks/gp', { headers });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length;


    return {
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,

      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || project.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filter]);

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      'on-hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-orange-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="text-blue-500 w-8 h-8" />
            Project Dashboard
          </h1>
          <p className="text-gray-700 mt-2 text-lg">Monitor and manage all your projects in one place</p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setShowCreateModal(true);
                setSelectedMembers([]);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.05] font-semibold shadow-lg"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Projects</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.activeProjects}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Task Completion</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.taskCompletionRate}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>


      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Projects</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                </div>
                {(userRole === 'admin' || userRole === 'manager') && (
                  <div className="relative group">
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setShowEditModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                {(userRole === 'admin' || userRole === 'manager') ? (
                  <select
                    value={project.status}
                    onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-full border cursor-pointer ${getStatusColor(project.status)}`}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                )}
                <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} Priority
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  {(userRole === 'admin' || userRole === 'manager') ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={project.progress || 0}
                      onChange={(e) => handleUpdateProgress(project._id, parseInt(e.target.value))}
                      className="w-16 text-right text-sm border border-gray-300 rounded px-1 py-0.5"
                    />
                  ) : (
                    <span className="font-medium">{project.progress || 0}%</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.team?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                </div>


              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team?.slice(0, 3).map((member, index) => (
                    <div
                      key={member.user?._id || index}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={`${member.user?.name || 'Unknown'} (${member.role})`}
                    >
                      {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  ))}
                  {project.team?.length > 3 && (
                    <div 
                      className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white"
                      title={`${project.team.length - 3} more members`}
                    >
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="text-blue-600 hover:text-purple-600 text-sm font-semibold transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first project to get started'
            }
          </p>
          {(userRole === 'admin' || userRole === 'manager') && (
            <button 
              onClick={() => {
                setShowCreateModal(true);
                setSelectedMembers([]);
              }}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 transition-transform duration-200 hover:shadow-[0_20px_70px_-5px_rgba(0,0,0,0.4)]">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const projectData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  endDate: formData.get('endDate')
                };
                handleCreateProject(projectData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  
                  {/* Team Members Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {users.map(user => (
                        <div key={user._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`user-${user._id}`}
                            checked={selectedMembers.includes(user._id)}
                            onChange={() => toggleMemberSelection(user._id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`user-${user._id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.role} - {user.department}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedMembers.length} member(s) selected</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 transition-transform duration-200 hover:shadow-[0_20px_70px_-5px_rgba(0,0,0,0.4)]">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Project</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const projectData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  endDate: formData.get('endDate'),
                  status: formData.get('status'),
                  progress: parseInt(formData.get('progress'))
                };
                handleEditProject(projectData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingProject.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingProject.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        defaultValue={editingProject.priority}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        defaultValue={editingProject.status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        required
                        defaultValue={editingProject.endDate?.split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                      <input
                        type="number"
                        name="progress"
                        min="0"
                        max="100"
                        defaultValue={editingProject.progress || 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Update Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;