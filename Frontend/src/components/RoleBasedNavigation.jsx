import React from 'react';
import {
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
  Shield,
  LogOut,
  Settings
} from 'lucide-react';
import { PRODUCTIVITY_CARD } from '../assets/dummy';

const RoleBasedNavigation = ({ userRole, currentPath, onNavigate, onLogout, tasks }) => {


const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter((t) => t.completed).length : 0;
  const productivity =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getNavigationItems = () => {
    const roleBasedItems = {
      admin: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: Shield, path: '/admin/dashboard' },
        { id: 'projects', label: 'All Projects', icon: FolderOpen, path: '/projects' },
        { id: 'tasks', label: 'Task Board', icon: CheckSquare, path: '/task-board' },
        { id: 'users', label: 'User Management', icon: Users, path: '/team' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
      ],
      manager: [
        { id: 'dashboard', label: 'Manager Dashboard', icon: Home, path: '/manager/dashboard' },
        { id: 'projects', label: 'My Projects', icon: FolderOpen, path: '/projects' },
        { id: 'tasks', label: 'Task Board', icon: CheckSquare, path: '/task-board' },
        { id: 'team', label: 'Team', icon: Users, path: '/team' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' }
      ],
      employee: [
        { id: 'dashboard', label: 'My Dashboard', icon: Home, path: '/employee/dashboard' },
        { id: 'tasks', label: 'My Tasks', icon: CheckSquare, path: '/task-board' },
        { id: 'projects', label: 'My Projects', icon: FolderOpen, path: '/projects' }
      ]
    };

    return roleBasedItems[userRole] || roleBasedItems.employee;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl border-r border-gray-100">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 ml-2">
              <span className="text-blue-600 font-bold text-sm">PM</span>
            </div>
            <h1 className="text-xl font-bold text-white">ProManage</h1>
          </div>
          {/* <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            {userRole?.toUpperCase()}
          </span> */}
        </div>

    {/* <div className='mt-4'>
          <div className={PRODUCTIVITY_CARD.container}>
                    <div className={PRODUCTIVITY_CARD.header}>
                      <h3 className={PRODUCTIVITY_CARD.label}>Productivity</h3>
                      <span className={PRODUCTIVITY_CARD.badge}>{productivity}%</span>
                    </div>
                    <div className={PRODUCTIVITY_CARD.barBg}>
                      <div
                        className={PRODUCTIVITY_CARD.barFg}
                        style={{ width: `${productivity}%` }}
                      />
                    </div>
                  </div>
    </div> */}


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:transform hover:scale-[1.01]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                }`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2 bg-gray-50/50">
          <button
            onClick={() => onNavigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-200 hover:shadow-sm"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedNavigation;