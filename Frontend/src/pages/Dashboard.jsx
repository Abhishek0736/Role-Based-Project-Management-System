import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ADD_BUTTON,
  HEADER,
  ICON_WRAPPER,
  STAT_CARD,
  STATS_GRID,
  VALUE_CLASS,
  WRAPPER,
  STATS,
  LABEL_CLASS,
  FILTER_WRAPPER,
  FILTER_OPTIONS,
  FILTER_LABELS,
  SELECT_CLASSES,
  TABS_WRAPPER,
  EMPTY_STATE,
  TAB_BASE,
  TAB_ACTIVE,
  TAB_INACTIVE,
} from "../assets/dummy";
import {
  Calendar,
  CalendarIcon,
  Filter,
  HomeIcon,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  FolderOpen,
  Activity
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";
import axios from "axios";

const API_BASE = "http://localhost:3000/api/tasks";

const Dashboard = () => {
  const outletContext = useOutletContext() || { tasks: [], refreshTasks: () => {} };
const { tasks, refreshTasks } = outletContext;  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  useEffect(() => {
    fetchProjects();
    // In a real app, you'd fetch the user's role and store it in state/context.
    // For now, we'll rely on localStorage for this demonstration.
  }, [outletContext]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      const response = await axios.get('http://localhost:3000/api/projects', { headers });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // const fetchRecentActivity = async () => {
  //   try {
  //     const activities = [
  //       { id: 1, type: 'task_completed', message: 'Task "Design Homepage" completed', time: '2 hours ago', user: 'John Doe' },
  //       { id: 2, type: 'project_created', message: 'New project "Mobile App" created', time: '4 hours ago', user: 'Jane Smith' },
  //       { id: 3, type: 'task_assigned', message: 'Task assigned to development team', time: '6 hours ago', user: 'Mike Johnson' },
  //       { id: 4, type: 'milestone_reached', message: 'Milestone "Phase 1" completed', time: '1 day ago', user: 'Sarah Wilson' },
  //     ];
  //     setRecentActivity(activities);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching recent activity:', error);
  //     setLoading(false);
  //   }
  // };

  const stats = useMemo(
    () => {
      const taskStats = {
        total: tasks.length,
        lowPriority: tasks.filter((task) => task.priority === "Low").length,
        mediumPriority: tasks.filter((task) => task.priority === "Medium").length,
        highPriority: tasks.filter((task) => task.priority === "High").length,
        completed: tasks.filter(
          (task) =>
            task.completed === true ||
            task.completed === 1 ||
            (
              typeof task.completed === "string" &&
              task.completed.toLowerCase() === "yes"
            )
        ).length,
        overdue: tasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
        ).length
      };

      const projectStats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        avgProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
      };

      return { ...taskStats, projects: projectStats };
    },
    [tasks, projects]
  );

  // Fliter Task
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        switch (filter) {
          case "today":
            return dueDate.toDateString() === today.toDateString();
          case "week":
            return dueDate >= today && dueDate <= nextWeek;
          case "high":
          case "medium":
          case "low":
            return task.priority?.toLowerCase() === filter;
          default:
            return true;
        }
      }),
    [tasks, filter]
  );

  const handleTaskSave = useCallback(async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      if (taskData.id) {
        await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData, { headers });
      } else {
        await axios.post(`${API_BASE}/gp`, taskData, { headers });
      }
      
      refreshTasks();
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  }, [refreshTasks])

  return (
    <div className={WRAPPER}>
      {/* Header */}
      <div className={HEADER}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl text-gray-800 font-bold flex items-center gap-2">
            <HomeIcon className="ml-5 text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="ml-12 text-sm text-gray-500 mt-1 ml-7 truncate">
            Manage your task efficiently
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
                {stats.total}
              </p>
              <p className="text-xs text-gray-500">Total Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>

        

        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.projects.active}</p>
              <p className="text-xs text-gray-500">Active Projects</p>
            </div>
          </div>
        </div>

        

        <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mb-5">
        {/* Recent Activity */}
        {/* <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Recent Activity
              </h3>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowModal(true)}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
              >
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Plus className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">New Task</span>
              </button>
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <button 
                  onClick={() => window.location.href = '/projects'}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">New Project</span>
                </button>
              )}
              
              {userRole === 'admin' && (
                <button 
                  onClick={() => window.location.href = '/team'}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add Member</span>
                </button>
              )}
              
              {(userRole === 'admin' || userRole === 'manager') && (
                <button 
                  onClick={() => window.location.href = '/analytics'}
                  className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                >
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              {FILTER_LABELS[filter]} ({filteredTasks.length})
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 md:hidden text-sm"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>

            <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    filter === opt 
                      ? "bg-white text-purple-700 shadow-sm border border-purple-100" 
                      : "text-gray-600 hover:text-purple-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className=" mt-5 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className={EMPTY_STATE.wrapper}>
            <div className={EMPTY_STATE.iconWrapper}>
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Tasks Found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === "all"
                  ? "Create your first task to get started."
                  : "No tasks match the filter"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className={EMPTY_STATE.btn}
              >
                Add New Task
              </button>
          </div>
        ) : (
          filteredTasks.map((task) => <TaskItem key={task._id || task.id} task={task} onRefresh={refreshTasks} showCompleteCheckbox onEdit={() => {
              setSelectedTask(task);
              setShowModal(true);
            }} />)
        )}
        </div>

        {/* Add Task */}
        <div onClick={() => setShowModal(true)} className="hidden md:flex items-center justify-center p-6 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 transition-all duration-200 cursor-pointer bg-gradient-to-r from-purple-50/50 to-fuchsia-50/50 group hover:shadow-md">
             <Plus className="w-5 h-5 text-purple-500 mr-2 group-hover:scale-110 transition-transform" />
             <span className="text-sm text-gray-600 font-medium group-hover:text-purple-700">
                Add New Task
             </span>
        </div>
      </div>

      {/* Modal */}
      <TaskModal 
        isOpen={showModal || !!selectedTask} 
        onClose={() => {
          setShowModal(false); 
          setSelectedTask(null);
        }} 
        taskToEdit={selectedTask} 
        onSave={handleTaskSave} 
        projects={projects}
      />
    </div>

  );
};

export default Dashboard;
