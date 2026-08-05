// Jaiak Studio API Client Layer

const API_BASE_URL = window.location.origin.includes('5000') || window.location.origin.includes('3000')
  ? '' 
  : 'http://localhost:3000';

class ApiService {
  static async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.warn(`API call failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  static async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(username, email, password) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  static async sendOtp(email) {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async resetPassword(email, otp, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  static async getUsers() {
    return this.request('/api/users');
  }

  static async updateProfile(oldEmail, username, email, phone, avatar, isProSubscribed) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ oldEmail, username, email, phone, avatar, isProSubscribed }),
    });
  }

  static getExportCsvUrl() {
    return `${API_BASE_URL}/users/export-csv`;
  }
}

window.ApiService = ApiService;
