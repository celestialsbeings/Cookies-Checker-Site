import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSystemStatus, checkCookiesAvailable } from '../../services/adminService';

const Dashboard: React.FC = () => {
  const [cookieCount, setCookieCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState({
    status: 'loading',
    uptime: 0,
    memoryUsage: {
      heapUsed: 0,
      heapTotal: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get cookie count
        const cookieData = await checkCookiesAvailable();
        setCookieCount(cookieData.count);
        
        // Get system status
        const statusData = await getSystemStatus();
        setSystemStatus({
          status: statusData.status,
          uptime: statusData.system.uptime,
          memoryUsage: {
            heapUsed: statusData.system.memoryUsage.heapUsed,
            heapTotal: statusData.system.memoryUsage.heapTotal
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format uptime to days, hours, minutes
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Format memory usage to MB
  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
        <h3 className="flex items-center text-lg font-medium mb-2">
          <AlertTriangle size={20} className="mr-2" />
          Error
        </h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cookie Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">Cookie Status</h3>
            <Cookie size={24} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{cookieCount}</div>
          <div className={`text-sm ${cookieCount < 10 ? 'text-red-400' : 'text-green-400'}`}>
            {cookieCount < 10 ? (
              <span className="flex items-center">
                <AlertTriangle size={16} className="mr-1" />
                Low on cookies!
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Cookies available
              </span>
            )}
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/cookies" 
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Manage Cookies →
            </Link>
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">System Status</h3>
            <Activity size={24} className="text-purple-400" />
          </div>
          <div className="flex items-center mb-2">
            <div className={`h-3 w-3 rounded-full mr-2 ${systemStatus.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="text-lg font-medium text-white">
              {systemStatus.status === 'ok' ? 'System Online' : 'System Error'}
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-gray-300">{formatUptime(systemStatus.uptime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Usage:</span>
              <span className="text-gray-300">
                {formatMemory(systemStatus.memoryUsage.heapUsed)} / {formatMemory(systemStatus.memoryUsage.heapTotal)}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/status" 
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View Details →
            </Link>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/admin/cookies" 
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-200">Upload Cookies</span>
              <Cookie size={18} className="text-purple-400" />
            </Link>
            <Link 
              to="/admin/status" 
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-200">System Status</span>
              <Activity size={18} className="text-purple-400" />
            </Link>
            <Link 
              to="/" 
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="text-gray-200">View Website</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
