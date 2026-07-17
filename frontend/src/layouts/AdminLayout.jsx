import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdComputer, 
  MdPeople, 
  MdShowChart, 
  MdExitToApp, 
  MdMenu, 
  MdClose,
  MdHome
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard size={22} /> },
    { name: 'Manage Laptops', path: '/admin/laptops', icon: <MdComputer size={22} /> },
    { name: 'Manage Users', path: '/admin/users', icon: <MdPeople size={22} /> },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: <MdShowChart size={22} /> },
  ];

  const handleLogout = () => {
    logout().then(() => {
      window.location.href = '/login';
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-darkBg text-gray-800 dark:text-gray-100">
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-darkCard border-r border-gray-200 dark:border-darkBorder transition-transform duration-300 transform md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Brand/Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 dark:border-darkBorder bg-primary-600 dark:bg-primary-900 text-white">
            <Link to="/" className="flex items-center gap-2 font-outfit text-xl font-bold">
              <span>Admin Console</span>
            </Link>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <MdClose size={24} />
            </button>
          </div>

          {/* User profile brief card */}
          <div className="p-4 border-b border-gray-200 dark:border-darkBorder flex items-center gap-3">
            <img 
              src={user?.profileImage} 
              alt="Admin Avatar" 
              className="w-10 h-10 rounded-full border-2 border-primary-500 object-cover"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{user?.name}</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} Mode</span>
            </div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout / Exit Buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-darkBorder space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <MdHome size={22} />
              <span>Back to Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-semibold"
            >
              <MdExitToApp size={22} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex flex-col flex-grow min-w-0">
        {/* Top bar header */}
        <header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-darkCard border-b border-gray-200 dark:border-darkBorder">
          <div className="flex items-center gap-4">
            <button 
              className="p-1 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <MdMenu size={26} />
            </button>
            <h2 className="font-outfit text-xl font-bold text-gray-800 dark:text-white capitalize">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 font-semibold rounded-full">
              System Live
            </span>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-darkBg">
          {children}
        </main>
      </div>
      
      {/* Mobile background overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
