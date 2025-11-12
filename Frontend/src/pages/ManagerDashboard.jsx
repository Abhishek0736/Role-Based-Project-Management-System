import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  CheckSquare,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [projectsResponse, tasksResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/projects', { headers }),
        axios.get('http://localhost:3000/api/tasks/gp', { headers }),
        axios.get('http://localhost:3000/api/user/all', { headers })
      ]);
      
      const projects = projectsResponse.data;
      const tasks = tasksResponse.data;
      setUsers(usersResponse.data);
      
      const stats = {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed || t.status === 'done').length,
        teamSize: projects.reduce((total, p) => total + (p.team?.length || 0), 0)
      };
      
      const teamMembers = [];
      projects.forEach(project => {
        project.team?.forEach(member => {
          if (!teamMembers.find(tm => tm._id === member.user._id)) {
            teamMembers.push(member.user);
          }
        });
      });
      
      setDashboardData({
        stats,
        myProjects: projects,
        teamMembers,
        recentActivities: tasks.slice(0, 5)
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const projectWithTeam = {
        ...projectData,
        team: selectedMembers.map(memberId => ({
          user: memberId,
          role: 'developer'
        })),
        members: selectedMembers
      };
      
      const response = await axios.post('http://localhost:3000/api/projects', projectWithTeam, { headers });
      
      if (response.data) {
        fetchDashboardData();
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

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await axios.put(`http://localhost:3000/api/user/${userId}`, { role: newRole }, { headers });
      fetchDashboardData();
      toast.success('Member role updated successfully!');
    } catch (error) {
      console.error('Error updating member role:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update member role';
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
        fetchDashboardData();
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
        fetchDashboardData();
        toast.success('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        const errorMsg = error.response?.data?.message || 'Failed to delete project';
        toast.error(errorMsg);
      }
    }
  };

  const handleEditTask = (task) => {
    const newTitle = prompt('Enter new task title:', task.title);
    if (newTitle && newTitle !== task.title) {
      updateTask(task._id, { title: newTitle });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        await axios.delete(`http://localhost:3000/api/tasks/${taskId}`, { headers });
        fetchDashboardData();
        toast.success('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMsg = error.response?.data?.message || 'Failed to delete task';
        toast.error(errorMsg);
      }
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.put(`http://localhost:3000/api/tasks/${taskId}`, updates, { headers });
      fetchDashboardData();
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update task';
      toast.error(errorMsg);
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      await axios.put(`http://localhost:3000/api/projects/${projectId}`, { status: newStatus }, { headers });
      fetchDashboardData();
      toast.success('Project status updated!');
    } catch (error) {
      console.error('Error updating project status:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update project status';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { stats, myProjects, tasksByStatus, teamMembers, recentActivities } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <Navbar />
      <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="text-purple-600 w-6 h-6" />
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage your projects and team</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setShowCreateModal(true);
              setSelectedMembers([]);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button 
            onClick={() => window.location.href = '/projects'}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FolderOpen className="w-4 h-4" />
            All Projects
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">My Projects</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats?.totalProjects || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.teamSize || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
          </div>
          <div className="p-6">
            {myProjects?.length > 0 ? (
              <div className="space-y-4">
                {myProjects.slice(0, 5).map((project) => (
                  <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <div className="mt-1">
                        <select
                          value={project.status}
                          onChange={(e) => handleUpdateProjectStatus(project._id, e.target.value)}
                          className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'on-hold' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{project.team?.length || 0} members</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => window.location.href = `/projects/${project._id}`}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Project"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProject(project);
                          setShowEditModal(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No projects yet</p>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          </div>
          <div className="p-6">
            {teamMembers?.length > 0 ? (
              <div className="space-y-4">
                {teamMembers.slice(0, 5).map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No team members yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Task Management */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
        </div>
        <div className="p-6">
          {recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.project?.name}</p>
                    <p className="text-xs text-gray-500">Assigned to: {task.assignedTo?.map(u => u.name).join(', ') || 'Unassigned'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => handleEditTask(task)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks found</p>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          {recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Task "{activity.title}" in project "{activity.project?.name}"
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === 'done' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </div>
      </div>

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
                  <div className="col-span-2">
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
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
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
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedMembers([]);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                  status: formData.get('status'),
                  endDate: formData.get('endDate'),
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

    </div>
  );
};


export default ManagerDashboard;