import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import axios from 'axios';

const UserModal = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    setUserData(userToEdit || { role: 'developer', isActive: true });
  }, [userToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{userToEdit ? 'Edit User' : 'Add New User'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" value={userData.name || ''} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={userData.email || ''} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            {!userToEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" onChange={handleChange} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={userData.role || 'developer'} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="developer">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="designer">Designer</option>
                  <option value="tester">Tester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input type="text" name="department" value={userData.department || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="isActive" name="isActive" checked={userData.isActive} onChange={handleChange} className="h-4 w-4 text-purple-600 border-gray-300 rounded" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">User is Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await axios.get('http://localhost:3000/api/user/all', { headers });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      if (userData._id) {
        // Update user
        await axios.put(`http://localhost:3000/api/user/${userData._id}`, userData, { headers });
      } else {
        // Create user
        await axios.post('http://localhost:3000/api/user/create', userData, { headers });
      }
      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Check console for details.');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        await axios.delete(`http://localhost:3000/api/user/${userId}`, { headers });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  };

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }), [users, searchTerm, roleFilter]);

  const roles = useMemo(() => [...new Set(users.map(user => user.role))], [users]);

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      developer: 'bg-blue-100 text-blue-800',
      designer: 'bg-green-100 text-green-800',
      tester: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-purple-600 w-6 h-6" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all system users and their roles.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
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
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">User</th>
              <th scope="col" className="px-6 py-3">Role</th>
              <th scope="col" className="px-6 py-3">Department</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Joined</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="pl-3">
                    <div className="text-base font-semibold">{user.name}</div>
                    <div className="font-normal text-gray-500">{user.email}</div>
                  </div>
                </th>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">{user.department || 'N/A'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(user)} className="p-2 hover:bg-gray-200 rounded-lg" title="Edit User">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="p-2 hover:bg-red-100 rounded-lg" title="Delete User">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      <UserModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        onSave={handleSaveUser}
        userToEdit={editingUser}
      />
    </div>
  );
};

export default UserManagement;