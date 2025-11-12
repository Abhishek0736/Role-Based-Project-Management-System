
import React, { useState, useCallback, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { TrendingUp, Circle, Clock, Zap } from "lucide-react";
import axios from "axios";

const Layout = ({ onLogout, user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole] = useState(localStorage.getItem('userRole') || 'employee');
  const [userId] = useState(localStorage.getItem('userId'));

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const { data } = await axios.get("http://localhost:3000/api/tasks/gp", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let arr = Array.isArray(data)
        ? data
        : Array.isArray(data.tasks)
        ? data.tasks
        : Array.isArray(data.data)
        ? data.data
        : [];
      
      // Filter tasks based on user role
      if (userRole === 'employee') {
        // Employees only see tasks assigned to them or created by them
        arr = arr.filter(task => 
          task.owner === userId || 
          task.assignedTo?.includes(userId) ||
          task.createdBy === userId
        );
      }
      // Admins and managers see all tasks
      
      setTasks(arr);
    } catch (error) {
      console.log("Error fetching tasks:", error);
      setError(error.message || "An error occurred while fetching tasks");
      if (error.message === "No authentication token found" || error.response?.status === 401) {
        console.log("Unauthorized access. Logging out...");
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length;

    const totalCount = tasks.length;
    const pendingTasks = totalCount - completedTasks;
    const completionRate = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingTasks,
      completionRate,
    };
  }, [tasks]);

  // StatCard Component
  const StatCart = ({ title, value, icon }) => (
    <div className="p-2 sm:p-4 md:p-4 bg-white shadow-sm border border-purple-200 hover:shadow-md transition-all duration-300 hover:border-purple-300 group">
      <div className="flex items-center gap-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 group-hover:from-fuchsia-500/20 group-hover:to-purple-500/20 ">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

  // Loading and Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex item-center justify-center">
        <div className="animate-spin rounded-full h-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md">
          <p className="font-medium md-2">Error loading tasks</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTasks}
            className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors focus:outline-none focus:ring focus:ring-red-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} tasks={tasks} />

      <div className="ml-0 md:ml-16 lg:ml-64 xl:ml-64 p-3 sm:p-6 transition-all duration-300">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Outlet context={{ tasks, refreshTasks: fetchTasks }} />
          </div>

          <aside className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-purple-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Task Statistics
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCart
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={<Circle className="w-4 h-4 text-purple-500" />}
                />

                <StatCart
                  title="Completed"
                  value={stats.completedTasks}
                  icon={<Circle className="w-4 h-4 text-green-500" />}
                />

                <StatCart
                  title="Pending"
                  value={stats.pendingTasks}
                  icon={<Circle className="w-4 h-4 text-fuchsia-500" />}
                />

                <StatCart
                  title="Completion Rate"
                  value={`${stats.completionRate}%`}
                  icon={<Zap className="w-4 h-4 text-purple-500" />}
                />
              </div>

              <hr className="my-3 border-purple-200" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <Circle className="w-3 h-3 text-purple-500" />
                    Task Progress
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {stats.completedTasks}/{stats.totalCount}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 sm:h-3 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-200">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Recent Activity
              </h3>

              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id || task.id}
                    className="flex items-center justify-between p-2 sm:p-3 hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-purple-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 break-words whitespace-normal">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {task.createAt
                          ? new Date(task.createAt).toLocaleString()
                          : "No date available"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                        task.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-fuchsia-100 text-fuchsia-700"
                      }`}
                    >
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="text-center py-4 sm:py-6 px-2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Your tasks will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Layout;
