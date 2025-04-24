// Authentication service for admin panel

// Store auth token in localStorage
const TOKEN_KEY = 'admin_auth_token';

// Default admin credentials (in a real app, this would be server-side only)
const ADMIN_USERNAME = 'celestialbeing';
const ADMIN_PASSWORD = 'az11002021'; // This should be hashed and stored securely in a real app

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Login function
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Call the server API for authentication
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (data.success) {
      // Store the token
      localStorage.setItem(TOKEN_KEY, data.token);

      return {
        success: true,
        token: data.token,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// Get auth token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
