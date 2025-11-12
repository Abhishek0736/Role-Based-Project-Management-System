import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Play,
  Eye,
  X,
  Tag
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [tasksResponse, projectsResponse, timeTrackingResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/tasks/gp', { headers }),
        axios.get('http://localhost:3000/api/projects', { headers }),
        axios.get('http://localhost:3000/api/time-tracking', { headers }).catch(() => ({ data: [] }))
      ]);
      
      const tasks = tasksResponse.data;
      const projects = projectsResponse.data;
      const timeEntries = timeTrackingResponse.data || [];

      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      const thisWeekEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startOfWeek && entryDate <= endOfWeek && entry.duration;
      });
      
      const hoursThisWeek = thisWeekEntries
        .reduce((sum, entry) => sum + (entry.duration / 60), 0); // Convert minutes to hours
      
      try {
  const timeTrackingLog = await axios.post('http://localhost:3000/api/time-tracking/log', {
    totalEntries: timeEntries.length,
    thisWeekEntries: thisWeekEntries.length, 
    hoursThisWeek,
    startOfWeek,
    endOfWeek
  }, { headers });

  setDashboardData(prevData => ({
    ...prevData,
    timeTracking: {
      totalEntries: timeEntries.length,
      thisWeekEntries: thisWeekEntries.length,
      hoursThisWeek,
      startOfWeek,
      endOfWeek,
      logData: timeTrackingLog.data
    }
  }));

} catch (error) {
  console.error('Error logging time tracking:', error);

}      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed || t.status === 'done').length,
        pendingTasks: tasks.filter(t => !t.completed && t.status !== 'done').length,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10 
      };
    
      const currentDate = new Date();
      const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) >= currentDate && 
        new Date(t.dueDate) <= nextWeek &&
        !t.completed
      );
      
      setDashboardData({
        stats,
        myTasks: tasks,
        myProjects: projects,
        upcomingDeadlines
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData(); 
      const statusText = newStatus === 'done' ? 'completed' : newStatus.replace('-', ' ');
      alert(`Task ${statusText} successfully!`);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(`Failed to update task status: ${error.response?.data?.message || 'Please try again.'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { stats, myTasks, myProjects, upcomingDeadlines, timeEntries } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <Navbar />
      <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="text-purple-600 w-6 h-6" />
            My Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track your tasks and progress</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">My Tasks</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats?.totalTasks || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingTasks || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.hoursThisWeek ? `${stats.hoursThisWeek}h` : '0h'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
          </div>
          <div className="p-6">
            {myTasks?.length > 0 ? (
              <div className="space-y-4">
                {myTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.project?.name}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
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
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {task.status !== 'done' && (
                        <div className="flex gap-1">
                          {task.status === 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                              title="Start Task"
                            >
                              Start
                            </button>
                          )}
                          {task.status === 'in-progress' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'done')}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              title="Complete Task"
                            >
                              Complete
                            </button>
                          )}
                          {task.status === 'todo' && (
                            <button
                              onClick={() => updateTaskStatus(task._id, 'done')}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              title="Mark as Done"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks assigned</p>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Upcoming Deadlines
            </h3>
          </div>
          <div className="p-6">
            {upcomingDeadlines?.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <div key={task._id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.project?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* My Projects */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Projects</h3>
        </div>
        <div className="p-6">
          {myProjects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((project) => (
                <div key={project._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <p className="text-xs text-gray-500">
                      Manager: {project.manager?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No projects assigned</p>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20 transition-transform duration-200 hover:shadow-[0_20px_70px_-5px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <p className="text-lg font-semibold text-gray-900">{selectedTask.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <p className="text-gray-900">{selectedTask.project?.name || 'No project assigned'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTask.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    selectedTask.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTask.status === 'done' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTask.status === 'todo' ? 'To Do' : 
                     selectedTask.status === 'in-progress' ? 'In Progress' : 
                     selectedTask.status === 'done' ? 'Done' : selectedTask.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <p className="text-gray-900">
                    {selectedTask.dueDate ? 
                      new Date(selectedTask.dueDate).toLocaleDateString('en-GB') : 
                      'No due date set'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                  <p className="text-gray-900">{selectedTask.estimatedHours || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags && selectedTask.tags.length > 0 ? (
                      selectedTask.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No tags added</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;