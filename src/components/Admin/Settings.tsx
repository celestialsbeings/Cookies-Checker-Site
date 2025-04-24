import React, { useState } from 'react';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const [lowCookieThreshold, setLowCookieThreshold] = useState(10);
  const [adCheckInterval, setAdCheckInterval] = useState(2000);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccess(null);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save these settings to the server
      // const response = await saveSettings({ lowCookieThreshold, adCheckInterval });
      
      setSuccess('Settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      {success && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-green-400 mb-6 flex items-start">
          <CheckCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>{success}</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400 mb-6 flex items-start">
          <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
        <h2 className="text-lg font-medium text-gray-200 mb-6">System Settings</h2>
        
        <div className="space-y-6">
          {/* Low Cookie Threshold */}
          <div>
            <label htmlFor="lowCookieThreshold" className="block text-sm font-medium text-gray-300 mb-2">
              Low Cookie Threshold
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="lowCookieThreshold"
                value={lowCookieThreshold}
                onChange={(e) => setLowCookieThreshold(parseInt(e.target.value) || 0)}
                min="1"
                max="100"
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
              />
              <span className="ml-3 text-gray-400">cookies</span>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Alert will be shown when cookie count falls below this threshold
            </p>
          </div>
          
          {/* Ad Check Interval */}
          <div>
            <label htmlFor="adCheckInterval" className="block text-sm font-medium text-gray-300 mb-2">
              Ad Check Interval
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="adCheckInterval"
                value={adCheckInterval}
                onChange={(e) => setAdCheckInterval(parseInt(e.target.value) || 0)}
                min="1000"
                max="10000"
                step="500"
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-24"
              />
              <span className="ml-3 text-gray-400">milliseconds</span>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Time to wait before checking if ads have loaded properly
            </p>
          </div>
          
          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className={`py-2 px-4 rounded-lg flex items-center ${
                saving
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
