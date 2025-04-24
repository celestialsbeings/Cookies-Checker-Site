// Browser-friendly configuration

// Get the API URL from the environment or use the current origin
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

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
