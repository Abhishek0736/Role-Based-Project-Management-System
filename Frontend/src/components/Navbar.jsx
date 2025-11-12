import React, { useState } from 'react';
import { 
  LogOut, 
  Settings, 
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const userRole = localStorage.getItem('userRole') || 
    (localStorage.getItem('isAdmin') ? 'admin' : 
     localStorage.getItem('isManager') ? 'manager' : 'employee');
  const userName = localStorage.getItem('userName') || 
    (userRole === 'admin' ? 'Admin User' :
     userRole === 'manager' ? 'Manager' : 'Employee');  const initial = userName.charAt(0).toUpperCase();
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <nav className="backdrop-blur-sm border-b border-purple-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* User Info */}
          <div className="flex items-center">
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 hover:bg-purple-50 rounded-xl transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {initial}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-purple-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-purple-500 capitalize font-medium">{userRole}</p>
                  </div>
                  <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors">
                    <Settings className="w-4 h-4 mr-2 text-purple-500" />
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;