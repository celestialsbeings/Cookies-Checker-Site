import React, { useState, useEffect } from 'react';
import { RefreshCw, Server, HardDrive, Clock, Cookie, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSystemStatus, checkCookiesAvailable } from '../../services/adminService';

const SystemStatus: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState({
    status: 'loading',
    cookieCount: 0,
    lowCookies: false,
    system: {
      uptime: 0,
      memoryUsage: {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0
      },
      nodeVersion: '',
      platform: ''
    }
  });

  const fetchSystemStatus = async () => {
    try {
      setRefreshing(true);
      const status = await getSystemStatus();
      setSystemInfo(status);
      setError(null);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setError('Failed to load system status. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format uptime to days, hours, minutes, seconds
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  // Format memory usage to MB with 2 decimal places
  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // Calculate memory usage percentage
  const calculateMemoryPercentage = () => {
    const { heapUsed, heapTotal } = systemInfo.system.memoryUsage;
    return (heapUsed / heapTotal) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">System Status</h1>
        <button
          onClick={fetchSystemStatus}
          className={`flex items-center py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors ${
            refreshing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 mb-6">
          <h3 className="flex items-center text-lg font-medium mb-2">
            <AlertTriangle size={20} className="mr-2" />
            Error
          </h3>
          <p>{error}</p>
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* System Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Server size={20} className="text-purple-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-200">System Status</h3>
          </div>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${systemInfo.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="text-lg font-medium text-white">
              {systemInfo.status === 'ok' ? 'Online' : 'Error'}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {systemInfo.status === 'ok'
              ? 'All systems operational'
              : 'System is experiencing issues'}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Clock size={20} className="text-purple-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-200">Uptime</h3>
          </div>
          <div className="text-lg font-medium text-white">
            {formatUptime(systemInfo.system.uptime)}
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Server started: {new Date(Date.now() - systemInfo.system.uptime * 1000).toLocaleString()}
          </div>
        </div>

        {/* Cookie Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Cookie size={20} className="text-purple-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-200">Cookie Status</h3>
          </div>
          <div className="text-lg font-medium text-white">
            {systemInfo.cookieCount} cookies available
          </div>
          <div className="mt-2 text-sm text-gray-400 flex items-center">
            {systemInfo.lowCookies ? (
              <span className="flex items-center text-red-400">
                <AlertTriangle size={16} className="mr-1" />
                Low cookie count!
              </span>
            ) : (
              <span className="flex items-center text-green-400">
                <CheckCircle size={16} className="mr-1" />
                Cookie count is healthy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <div className="flex items-center mb-4">
          <HardDrive size={20} className="text-purple-400 mr-3" />
          <h3 className="text-lg font-medium text-gray-200">Memory Usage</h3>
        </div>

        <div className="space-y-4">
          {/* Heap Memory */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">Heap Memory</span>
              <span className="text-sm text-gray-300">
                {formatMemory(systemInfo.system.memoryUsage.heapUsed)} / {formatMemory(systemInfo.system.memoryUsage.heapTotal)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: `${calculateMemoryPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* RSS Memory */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">RSS Memory</span>
              <span className="text-sm text-gray-300">{formatMemory(systemInfo.system.memoryUsage.rss)}</span>
            </div>
          </div>

          {/* External Memory */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">External Memory</span>
              <span className="text-sm text-gray-300">{formatMemory(systemInfo.system.memoryUsage.external)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">System Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Node.js Version</div>
            <div className="text-white">{systemInfo.system.nodeVersion}</div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Platform</div>
            <div className="text-white">{systemInfo.system.platform}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
