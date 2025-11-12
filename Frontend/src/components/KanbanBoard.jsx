import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';

const KanbanBoard = ({ projectId, searchTerm, filterStatus }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' }
  ];

  const priorityColors = {
    Low: 'bg-green-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500'
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks/gp');
      let filteredTasks = response.data;
      
      if (projectId) {
        filteredTasks = response.data.filter(task => task.project?._id === projectId);
      }
      
      setTasks(filteredTasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus, completed: newStatus === 'done' } : task
      ));
      toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
    } catch (error) {
      console.error('Task update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');
      // Refresh tasks to get current state
      fetchTasks();
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = filteredTasks.find(t => t._id === taskId);
    
    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const TaskCard = ({ task }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task._id)}
      className="bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30 cursor-move hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] hover:bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <span className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}></span>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{task.assignedTo?.length > 0 ? task.assignedTo[0].name : 'Unassigned'}</span>
        {task.dueDate && (
          <span className={`px-2 py-1 rounded ${
            new Date(task.dueDate) < new Date() && !task.completed 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto bg-gradient-to-br from-slate-100 to-blue-100">
      <div className="flex gap-8 min-w-max p-8">
        {columns.map(column => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-[340px] bg-white/90 backdrop-blur-lg rounded-3xl p-7 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-wide">{column.title}</h3>
              <span className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                {filteredTasks.filter(task => task.status === column.id).length}
              </span>
            </div>
            
            <div className="space-y-4 min-h-[250px] transition-all duration-300">
              {filteredTasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;