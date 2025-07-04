// Browser-friendly configuration

// Helper function to safely access import.meta.env in browser environments
const getEnvVar = (key: string, defaultValue: string): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In browser, try to get from import.meta.env (Vite) or use default
    try {
      // @ts-ignore - Ignore TypeScript error for server build
      return import.meta.env?.[key] || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  // In Node.js environment (server build), use default
  return defaultValue;
};

// Get the API URL from the environment or use a default
export const API_URL = getEnvVar('VITE_API_URL',
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Export other browser-friendly configuration
export const config = {
  API_URL,
  ENDPOINTS: {
    CLAIM_COOKIE: '/api/claim-cookie',
    CHECK_COOKIES: '/api/check-cookies',
    GAME_WIN: '/api/game-win'
  }
};

export default config;
