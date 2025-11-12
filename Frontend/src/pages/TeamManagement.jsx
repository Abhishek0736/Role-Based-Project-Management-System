import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  FolderOpen
} from 'lucide-react';
import axios from 'axios';

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem('userRole'));
  
  // Redirect employees - they can't access team management
  useEffect(() => {
    if (userRole === 'employee') {
      alert('Access Denied: Employees cannot access team management');
      window.location.href = '/';
      return;
    }
  }, [userRole]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/projects', { headers });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/tasks/gp', { headers });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getUserProjectStats = (userId) => {
    const userProjects = projects.filter(p => 
      p.owner === userId || p.team?.some(member => member.user._id === userId)
    );
    const userTasks = tasks.filter(t => 
      t.owner === userId || t.assignedTo?.includes(userId)
    );
    
    return {
      projectCount: userProjects.length,
      taskCount: userTasks.length,
      completedTasks: userTasks.filter(t => t.completed).length,
      productivity: userTasks.length > 0 ? Math.round((userTasks.filter(t => t.completed).length / userTasks.length) * 100) : 0
    };
  };

  const handleViewUser = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  const handleEditUser = async (userId) => {
    // For now, just show an alert - in real app would open edit modal
    alert('Edit user functionality - would open edit modal');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        await axios.delete(`http://localhost:3000/api/user/${userId}`, { headers });
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleAddMember = () => {
    // For now, redirect to signup - in real app would open add member modal
    window.location.href = '/signup';
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/user/all', { headers });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      developer: 'bg-blue-100 text-blue-800 border-blue-200',
      designer: 'bg-green-100 text-green-800 border-green-200',
      tester: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      client: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
  const roles = [...new Set(users.map(user => user.role))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-purple-600 w-6 h-6" />
            Team Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your team members and their roles</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={handleAddMember}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <UserPlus size={18} />
            Add Team Member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                ${Math.round(users.reduce((sum, u) => sum + (u.hourlyRate || 0), 0) / users.length || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.department || 'No Department'}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                {user.hourlyRate > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>${user.hourlyRate}/hour</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.isActive)}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>



              {user.skills && user.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {user.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{user.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleViewUser(user._id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="View Profile"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleEditUser(user._id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {user.lastLogin ? `Last seen ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || roleFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first team member to get started'
            }
          </p>
          <button 
            onClick={handleAddMember}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Add Team Member
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;