// const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ok777-render.onrender.com/api/v1';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
/**
 * API service for communicating with the backend
 */
class ApiService {
  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`; 
      
      // Get token from localStorage for authenticated requests
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Build headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      // Add authorization token if available (unless already set)
      if (token && !headers['Authorization']) {
        headers['Authorization'] = token;
      }
      
      const config = {
        method: options.method || 'GET',
        headers,
        mode: 'cors', // Explicitly set CORS mode for HTTPS
        credentials: 'omit', // Don't send cookies unless needed
      };

      // Add body if present (for POST, PUT, etc.)
      if (options.body) {
        config.body = options.body;
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If unauthorized, clear token
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Enhanced error logging for debugging HTTPS issues
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Check if we're using HTTPS - SSL errors are common with HTTPS
        const isHTTPS = API_BASE_URL.startsWith('https://');
        
        if (isHTTPS) {
          console.error('🔒 HTTPS Connection Error');
          console.error('The browser is blocking the request. This is often due to:');
          console.error('');
          console.error('1. ❌ SSL Certificate Issue (ERR_SSL_KEY_USAGE_INCOMPATIBLE)');
          console.error('   - The SSL certificate on the proxy server is invalid or misconfigured');
          console.error('   - Solution: Install a valid SSL certificate with proper key usage extensions');
          console.error('');
          console.error('2. 🔧 Temporary Workaround (Development Only):');
          console.error('   - Open a new tab and visit: https://156.238.242.137:8443/api/v1');
          console.error('   - Click "Advanced" → "Proceed to 156.238.242.137 (unsafe)"');
          console.error('   - This will allow the browser to accept the certificate for this session');
          console.error('');
          console.error('3. ✅ Production Solution:');
          console.error('   - Obtain a valid SSL certificate (Let\'s Encrypt, commercial CA, etc.)');
          console.error('   - Ensure the certificate has proper Key Usage and Extended Key Usage');
          console.error('   - Configure the proxy server to use the valid certificate');
          console.error('');
          console.error('URL:', `${API_BASE_URL}${endpoint}`);
          throw new Error('HTTPS Connection Failed: SSL certificate error detected. Please visit https://156.238.242.137:8443/api/v1 in your browser first to accept the certificate, or contact the administrator to install a valid SSL certificate.');
        }
        
        console.error('API request failed - Network error. Possible causes:');
        console.error('1. SSL certificate issue (self-signed certificate)');
        console.error('2. CORS configuration on backend');
        console.error('3. Network connectivity issue');
        console.error('4. Backend server not responding');
        console.error('URL:', `${API_BASE_URL}${endpoint}`);
        throw new Error('Network error: Unable to connect to server. Please check your connection and ensure the backend server is running.');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise} Login response with token and user data
   */
  async login(email, password) {
    try {
      // Clear any existing tokens first
      this.logout();
      
      const response = await this.request('/admin/signin', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      // Store token and user data if login successful
      if (response.code === 200 && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response;
      } else {
        // Clear on failed login
        this.logout();
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      // Clear any existing token on login failure
      this.logout();
      throw error;
    }
  }

  /**
   * Logout - Clear all authentication data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists
   */
  isAuthenticated() {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  /**
   * Get provider games
   * @param {number} code - Product code (default: 1020)
   * @returns {Promise} Game list
   */
  async getProviderGames(code = 1020) {
    return this.request(`/operators/provider-games?code=${code}`);
  }

  /**
   * Launch a game
   * @param {Object} gameData - Game data containing product_code, game_type, game_code, etc.
   * @returns {Promise} Launch response with game URL
   */
  async launchGame(gameData) {
    const payload = {
      product_code: String(gameData.productCode),
      game_type: gameData.gameType,
      game_code: gameData.gameCode,
      currency: gameData.currency || 'IDR',
      language_code: Number(
        typeof gameData.languageCode === 'number'
          ? gameData.languageCode
          : parseInt(gameData.languageCode || 0, 10)
      ) || 0,
    };

    return this.request('/operators/launch-game', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

// Export singleton instance
export default new ApiService();