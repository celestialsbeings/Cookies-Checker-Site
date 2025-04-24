import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, AlertTriangle } from 'lucide-react';
import { login, LoginCredentials } from '../../services/authService';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page to redirect to after login
  const from = location.state?.from?.pathname || '/admin/';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const response = await login(credentials);
      
      if (response.success) {
        // Redirect to the page they were trying to access
        navigate(from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-800 rounded-full">
              <Lock className="w-10 h-10 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400">Enter your credentials to access the admin panel</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-lg">
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 mb-6 flex items-start">
              <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg pl-10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                  loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          
          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="mt-1">In a production environment, use secure credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
