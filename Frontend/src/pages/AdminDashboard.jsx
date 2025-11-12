import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderOpen,
  CheckSquare,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [usersRes, projectsRes, tasksRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/user/all', { headers }),
        axios.get('http://localhost:3000/api/projects', { headers }),
        axios.get('http://localhost:3000/api/tasks/gp', { headers }),
        axios.get('http://localhost:3000/api/user/stats', { headers })
      ]);

      setUsers(usersRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.post('http://localhost:3000/api/user/create', userData, { headers });
      fetchData();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        await axios.delete(`http://localhost:3000/api/user/${userId}`, { headers });
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.put(`http://localhost:3000/api/user/${userId}`, { role: newRole }, { headers });
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
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
        fetchData();
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.put(`http://localhost:3000/api/tasks/${taskId}`, updates, { headers });
      fetchData();
      alert('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
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
      fetchData();
      alert('Project status updated successfully!');
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-purple-600 w-6 h-6" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">System overview and user management</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Projects</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{projects.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{tasks.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.activeUsers || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Management */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Project Management</h3>
        </div>
        <div className="p-6">
          {projects?.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 10).map((project) => (
                <div key={project._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.description}</p>
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
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      project.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {project.priority}
                    </span>
                    <p className="text-xs text-gray-500">{project.team?.length || 0} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No projects found</p>
          )}
        </div>
      </div>

      {/* Task Management */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 mb-8">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Task Management</h3>
        </div>
        <div className="p-6">
          {tasks?.length > 0 ? (
            <div className="space-y-4">
              {tasks.slice(0, 10).map((task) => (
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

      {/* User Management Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">User Management</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 transition-transform duration-200 hover:shadow-[0_20px_70px_-5px_rgba(0,0,0,0.4)]">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleCreateUser({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  role: formData.get('role'),
                  department: formData.get('department')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Create User
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

export default AdminDashboard;