import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Target, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import { toast } from 'react-toastify';
import TaskModal from '../components/TaskModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchProject();
    fetchProjectTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      toast.error('Failed to fetch project details');
      navigate('/projects');
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await api.get('/api/tasks/gp');
      const projectTasks = response.data.filter(task => task.project?._id === id);
      setTasks(projectTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-orange-600',
      Critical: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {project.name}
          </h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </button>
        )}
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Team Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{project.team?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Due Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Project Tasks ({tasks.length})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">Create your first task to get started</p>
            {(userRole === 'admin' || userRole === 'manager') && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white/50 p-4 rounded-xl border border-white/30 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>
                      {task.dueDate && (
                        <span className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.assignedTo?.length > 0 && (
                    <div className="flex -space-x-2">
                      {task.assignedTo.slice(0, 3).map((user, index) => (
                        <div
                          key={user._id || index}
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                          title={user.name}
                        >
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={() => {
            setShowTaskModal(false);
            fetchProjectTasks();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetails;