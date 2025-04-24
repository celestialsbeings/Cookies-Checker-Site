// Use the current origin as the API URL to avoid CORS issues
const API_URL = window.location.origin;

// Interface for cookie count response
interface CookieCountResponse {
  available: boolean;
  count: number;
}

// Interface for system status response
interface SystemStatusResponse {
  status: string;
  cookieCount: number;
  lowCookies: boolean;
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
  };
}

// Interface for cookie upload response
interface CookieUploadResponse {
  success: boolean;
  message: string;
  count?: number;
}

// Interface for clear cookies response
interface ClearCookiesResponse {
  success: boolean;
  message: string;
}

/**
 * Check available cookies
 */
export const checkCookiesAvailable = async (): Promise<CookieCountResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/check-cookies`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking cookies:', error);
    return { available: false, count: 0 };
  }
};

/**
 * Get system status
 */
export const getSystemStatus = async (): Promise<SystemStatusResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/admin/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting system status:', error);
    throw error;
  }
};

/**
 * Upload cookies from a zip file
 */
export const uploadCookiesZip = async (file: File): Promise<CookieUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('cookieZip', file);

    const response = await fetch(`${API_URL}/api/admin/upload-cookies-zip`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading cookies zip:', error);
    throw error;
  }
};

/**
 * Upload a single cookie file
 */
export const uploadCookieFile = async (file: File): Promise<CookieUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('cookieFile', file);

    const response = await fetch(`${API_URL}/api/admin/upload-cookie-file`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading cookie file:', error);
    throw error;
  }
};

/**
 * Clear all cookies
 */
export const clearAllCookies = async (): Promise<ClearCookiesResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/admin/clear-cookies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing cookies:', error);
    throw error;
  }
};

export default {
  checkCookiesAvailable,
  getSystemStatus,
  uploadCookiesZip,
  uploadCookieFile,
  clearAllCookies
};
