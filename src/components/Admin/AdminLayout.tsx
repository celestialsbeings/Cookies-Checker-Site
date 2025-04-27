import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cookie,
  Activity,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  LogOut
} from 'lucide-react';
import { logout } from '../../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { checkCookiesAvailable } from '../../services/adminService';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cookieCount, setCookieCount] = useState(0);
  const [lowCookieAlert, setLowCookieAlert] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Check cookie count periodically
  useEffect(() => {
    const checkCookies = async () => {
      try {
        const response = await checkCookiesAvailable();
        setCookieCount(response.count);
        setLowCookieAlert(response.count < 10);
      } catch (error) {
        console.error('Error checking cookies:', error);
      }
    };

    // Check immediately
    checkCookies();

    // Then check every 30 seconds
    const interval = setInterval(checkCookies, 30000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '.', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: 'cookies', label: 'Cookie Manager', icon: <Cookie size={20} /> },
    { path: 'status', label: 'System Status', icon: <Activity size={20} /> },
    { path: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '.') {
      // Dashboard is active when we're at /admin/ or /admin
      return currentPath === '/admin/' || currentPath === '/admin';
    }
    // For other paths, check if the current path ends with the path segment
    return currentPath.endsWith(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4 lg:hidden text-gray-400 hover:text-white"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="." className="text-xl font-bold text-purple-400">
            Cookie Catcher Admin
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {lowCookieAlert && (
            <div className="relative">
              <Bell size={24} className="text-yellow-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                !
              </span>
            </div>
          )}
          <div className="text-sm">
            <span className="text-gray-400">Cookies: </span>
            <span className={`font-medium ${cookieCount < 10 ? 'text-red-400' : 'text-green-400'}`}>
              {cookieCount}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
              <nav className="absolute top-0 left-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 py-6 px-4">
                <div className="mb-8 px-4">
                  <h2 className="text-xl font-bold text-purple-400">Admin Panel</h2>
                </div>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-gray-700 text-purple-400'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.label === 'Cookie Manager' && lowCookieAlert && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            !
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar for desktop */}
        <nav className="hidden lg:block w-64 bg-gray-800 border-r border-gray-700 py-6 px-4">
          <div className="mb-8 px-4">
            <h2 className="text-xl font-bold text-purple-400">Admin Panel</h2>
          </div>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-700 text-purple-400'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.label === 'Cookie Manager' && lowCookieAlert && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
