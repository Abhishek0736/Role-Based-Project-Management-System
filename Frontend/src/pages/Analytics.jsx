import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Target,
  DollarSign,
  Activity,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem('userRole'));
  
  // Redirect employees - they can't access analytics
  useEffect(() => {
    if (userRole === 'employee') {
      alert('Access Denied: Employees cannot access analytics');
      window.location.href = '/';
      return;
    }
  }, [userRole]);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get('http://localhost:3000/api/projects', { headers }),
        axios.get('http://localhost:3000/api/tasks/gp', { headers }),
        axios.get('http://localhost:3000/api/user/all', { headers })
      ]);
      
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const analytics = useMemo(() => {
    const now = new Date();
    const timeRangeDate = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));

    // Filter data by time range
    const recentProjects = projects.filter(p => new Date(p.createdAt) >= timeRangeDate);
    const recentTasks = tasks.filter(t => new Date(t.createdAt) >= timeRangeDate);

    // Calculate project progress based on tasks
    const calculateProjectProgress = (projectId) => {
      const projectTasks = tasks.filter(t => t.project === projectId);
      if (projectTasks.length === 0) return 0;
      const completedTasks = projectTasks.filter(t => t.completed).length;
      return Math.round((completedTasks / projectTasks.length) * 100);
    };

    // Project Analytics with real progress calculation
    const projectStats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + calculateProjectProgress(p._id), 0) / projects.length) : 0,
      withTeam: projects.filter(p => p.team && p.team.length > 0).length,
      withoutTeam: projects.filter(p => !p.team || p.team.length === 0).length,
      fullyCompleted: projects.filter(p => calculateProjectProgress(p._id) === 100).length
    };

    // Task Analytics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed).length,
      highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
    };



    // Team Analytics
    const teamStats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      avgHourlyRate: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.hourlyRate || 0), 0) / users.length) : 0
    };

    // Productivity Trends
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const completedTasks = tasks.filter(t => {
        const completedDate = new Date(t.updatedAt);
        return t.completed && 
               completedDate.toDateString() === date.toDateString();
      }).length;
      
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedTasks
      };
    }).reverse();

    return {
      projectStats,
      taskStats,

      teamStats,
      productivityTrend: last7Days,
      recentActivity: {
        newProjects: recentProjects.length,
        newTasks: recentTasks.length,
        completedTasks: recentTasks.filter(t => t.completed).length
      }
    };
  }, [projects, tasks, users, timeRange]);

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: `${timeRange} days`,
      analytics
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pms-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

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
            <BarChart3 className="text-purple-600 w-6 h-6" />
            Analytics & Reports
          </h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics for your projects</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportReport}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.projectStats.active}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">+{analytics.recentActivity.newProjects} this period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Task Completion</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.taskStats.completionRate}%</p>
              <div className="flex items-center gap-1 mt-1">
                <Activity className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600">{analytics.recentActivity.completedTasks} completed</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>



        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.teamStats.active}</p>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600">
                  ${analytics.teamStats.avgHourlyRate}/hr avg
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Productivity Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productivity Trend</h3>
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {analytics.productivityTrend.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{day.date}</span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((day.completed / Math.max(...analytics.productivityTrend.map(d => d.completed))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{day.completed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="text-sm font-medium">{analytics.projectStats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">{analytics.projectStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">On Hold</span>
              </div>
              <span className="text-sm font-medium">{analytics.projectStats.onHold}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="text-sm font-medium">{analytics.projectStats.cancelled}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Task Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Tasks</span>
              <span className="font-semibold">{analytics.taskStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{analytics.taskStats.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">{analytics.taskStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{analytics.taskStats.overdue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">High Priority</span>
              <span className="font-semibold text-orange-600">{analytics.taskStats.highPriority}</span>
            </div>
          </div>
        </div>

        {/* Team Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Team by Role
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.teamStats.byRole).map(([role, count]) => (
              <div key={role} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{role}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default Analytics;