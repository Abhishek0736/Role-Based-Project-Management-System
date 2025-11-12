import { Navigate } from 'react-router-dom';
import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Make toast available globally
window.toast = toast;

import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectDashboard from './pages/ProjectDashboard.jsx';
import TeamManagement from './pages/TeamManagement.jsx';
import Analytics from './pages/Analytics.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import RoleBasedNavigation from './components/RoleBasedNavigation.jsx';

import PendingPage from './pages/PendingPage.jsx';
import CompletePage from './pages/CompletePage.jsx';
import Profile from './components/Profile.jsx';
import TaskBoard from './pages/TaskBoard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';

const App = () => {

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored): null
  });
  
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'employee');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    const storedRole = localStorage.getItem('userRole');
    
    if (token && storedUser && storedRole) {
      setCurrentUser(JSON.parse(storedUser));
      setUserRole(storedRole);
    } else {
      localStorage.clear();
      setCurrentUser(null);
      setUserRole('employee');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

const handleAuthSubmit = data => {
    const user = {
      email: data.email,
      name: data.name || "User",
      role: data.role || 'employee',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "User")}&background=random`
    }
    setCurrentUser(user);
    setUserRole(data.role || 'employee');
    localStorage.setItem('userRole', data.role || 'employee');
    
    // Navigation will be handled by Login component
  }

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setUserRole('employee');
    navigate("/login", { replace: true });
  }

  const ProtectedLayout = () => {
    const handleNavigate = (path) => {
      setCurrentPath(path);
      navigate(path);
    };
    
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <RoleBasedNavigation 
          userRole={userRole} 
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <div className="flex-1 ml-64 overflow-auto">
          <Outlet />
        </div>
      </div>
    );
  };


  // const isAuthenticated = Boolean(localStorage.getItem('token'));


  return (
    <>
      <Routes>
        <Route path="/login" element={<div className='min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4'>
          <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate("/signup")}/>
        </div>} />

        <Route path="/signup" element={<div className='min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4'>
          <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate("/login")}/>
        </div>} />

        <Route element={currentUser ? <ProtectedLayout /> : <Navigate to="/login" replace />}>
          {/* Role-based dashboard routes */}
          <Route path="/" element={
            userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
            userRole === 'manager' ? <Navigate to="/manager/dashboard" replace /> :
            <Navigate to="/employee/dashboard" replace />
          } />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
          
          {/* Manager routes */}
          <Route path="/manager/dashboard" element={userRole === 'manager' ? <ManagerDashboard /> : <Navigate to="/" replace />} />
          
          {/* Employee routes */}
          <Route path="/employee/dashboard" element={userRole === 'employee' ? <EmployeeDashboard /> : <Navigate to="/" replace />} />
          
          {/* Legacy routes */}
          <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectDashboard />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/task-board" element={<TaskBoard />} />
          <Route path="/team" element={userRole === 'employee' ? <Navigate to="/" replace /> : <TeamManagement />} />
          <Route path="/analytics" element={userRole === 'employee' ? <Navigate to="/" replace /> : <Analytics />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/complete" element={<CompletePage />} />
          <Route path="/profile" element={<Profile users={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout}/>}/>
        </Route>
        <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="backdrop-blur-lg bg-white/90 border border-gray-200 shadow-xl rounded-xl"
        bodyClassName="text-gray-800 font-medium"
        progressClassName="bg-gradient-to-r from-blue-500 to-purple-600"
      />
    </>
  )
}

export default App
