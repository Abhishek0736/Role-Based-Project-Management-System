import React, { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import api from '../config/api';
import { toast } from 'react-toastify';
import { Plus, Filter, Search } from 'lucide-react';

const TaskBoard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    }
  };

  const handleCreateTask = () => {
    if (!selectedProject && userRole !== 'admin') {
      toast.error('Please select a project first');
      return;
    }
    setShowTaskModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/30 p-8 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">
            Task Board
          </h1>
          {(userRole === 'admin' || userRole === 'manager') && (
            <button
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl flex items-center gap-3 font-bold transition-all duration-300 transform hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus size={24} className="animate-pulse" />
              Create Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-8 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 group-hover:scale-110 transition-transform duration-200" size={22} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-xl border-2 border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              />
            </div>
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-6 py-4 bg-white/90 backdrop-blur-xl border-2 border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg min-w-[200px]"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 bg-white/90 backdrop-blur-xl border-2 border-white/40 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg min-w-[180px]"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard 
          projectId={selectedProject}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          projectId={selectedProject}
          onTaskCreated={() => {
            setShowTaskModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};

export default TaskBoard;