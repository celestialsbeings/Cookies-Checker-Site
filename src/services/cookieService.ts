interface CookieResponse {
  success: boolean;
  message: string;
  filename?: string;
  content?: string;
  remainingCookies?: number;
  cookieId?: string;
}

interface GameWinResponse {
  success: boolean;
  token: string;
  message: string;
}

export class CookieService {
  private static getApiUrl(): string {
    // In browser, use the same origin as the page
    if (typeof window !== 'undefined') {
      // Always use the current domain
      return window.location.origin;
    }
    // Fallback for server-side
    return 'http://localhost:3001';
  }

  private static async makeRequest(endpoint: string, params?: any): Promise<CookieResponse | GameWinResponse> {
    try {
      let url;
      let method = 'GET';
      let body = undefined;

      if (endpoint === 'claim' && params?.token) {
        url = `${this.getApiUrl()}/api/claim-cookie?token=${encodeURIComponent(params.token)}`;
      } else if (endpoint === 'check') {
        url = `${this.getApiUrl()}/api/check-cookies`;
      } else if (endpoint === 'win') {
        url = `${this.getApiUrl()}/api/game-win`;
        method = 'POST';
        body = JSON.stringify(params);
      } else {
        throw new Error('Invalid endpoint');
      }

      console.log(`Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body
      });

      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);

      try {
        const data = JSON.parse(text);

        // Check for error responses
        if (response.status >= 400) {
          return {
            success: false,
            message: data.message || `Error: ${response.status} ${response.statusText}`
          };
        }

        // For successful responses, ensure success is true
        return {
          ...data,
          success: true
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return {
          success: false,
          message: `Error parsing response: ${text.substring(0, 100)}...`
        };
      }
    } catch (error) {
      console.error('Request error:', error);
      return {
        success: false,
        message: `Error connecting to cookie service: ${error}`
      };
    }
  }

  static async submitGameWin(score: number): Promise<GameWinResponse> {
    return this.makeRequest('win', { score, level: 1, time: Date.now() }) as Promise<GameWinResponse>;
  }

  static async getAvailableCookie(token: string): Promise<CookieResponse> {
    return this.makeRequest('claim', { token }) as Promise<CookieResponse>;
  }

  static async checkAvailability(): Promise<CookieResponse> {
    return this.makeRequest('check') as Promise<CookieResponse>;
  }
}