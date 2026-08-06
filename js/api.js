// Jaiak Studio API Client Layer (Hybrid: Render Server + GitHub Pages Client Fallback)

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalhost
  ? 'http://localhost:3000'
  : 'https://musicstudio-v7xf.onrender.com';

// Client-side LocalStorage DB for Offline/Fallback Mode
function getLocalUsersDB() {
  try {
    return JSON.parse(localStorage.getItem('jaiak_users_db') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalUsersDB(users) {
  localStorage.setItem('jaiak_users_db', JSON.stringify(users));
}

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
    try {
      return await this.request('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      // Fallback for offline mode or network timeouts
      const users = getLocalUsersDB();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        return { message: 'Login successful (Offline Fallback)', user };
      }
      // Create new user on the fly if logging in for first time offline
      const newUser = {
        name: email.split('@')[0],
        username: email.split('@')[0],
        email: email,
        phone: '',
        avatar: '👤',
        isProSubscribed: false
      };
      users.push(newUser);
      saveLocalUsersDB(users);
      return { message: 'Login successful (Offline Fallback)', user: newUser };
    }
  }

  static async register(username, email, password) {
    try {
      return await this.request('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
    } catch (err) {
      const users = getLocalUsersDB();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('User with this email already exists.');
      }
      const newUser = {
        name: username,
        username: username,
        email: email,
        phone: '',
        avatar: '👤',
        isProSubscribed: false
      };
      users.push(newUser);
      saveLocalUsersDB(users);
      return { message: 'User registered (Offline Fallback)', user: newUser };
    }
  }

  static async sendOtp(email) {
    try {
      return await this.request('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      const demoOtp = '123456';
      return { message: 'OTP sent (Offline Fallback)', otp: demoOtp };
    }
  }

  static async resetPassword(email, otp, newPassword) {
    try {
      return await this.request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
    } catch (err) {
      return { message: 'Password reset successful (Offline Fallback)' };
    }
  }

  static async getUsers() {
    try {
      const data = await this.request('/api/users');
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.users)) return data.users;
      return getLocalUsersDB();
    } catch (err) {
      console.warn('API getUsers fallback:', err.message);
      return getLocalUsersDB();
    }
  }

  static async updateProfile(oldEmail, username, email, phone, avatar, isProSubscribed) {
    try {
      return await this.request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ oldEmail, username, email, phone, avatar, isProSubscribed }),
      });
    } catch (err) {
      const users = getLocalUsersDB();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === (oldEmail || '').toLowerCase());
      const updatedUser = {
        name: username,
        username: username,
        email: email,
        phone: phone || '',
        avatar: avatar || '👤',
        isProSubscribed: Boolean(isProSubscribed)
      };

      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
      } else {
        users.push(updatedUser);
      }
      saveLocalUsersDB(users);
      return { message: 'Profile updated (Offline Fallback)', user: updatedUser };
    }
  }

  static getExportCsvUrl() {
    const users = getLocalUsersDB();
    if (users.length === 0) {
      users.push({ name: 'Guest Producer', username: 'Guest Producer', email: 'guest@jaiakstudio.com', phone: '+91 9876543210', avatar: '🎧', isProSubscribed: true });
    }
    const headers = ['Name', 'Email', 'Phone', 'Avatar', 'Pro Subscribed'];
    const rows = users.map(u => [u.username || u.name, u.email, u.phone || '', u.avatar || '', u.isProSubscribed ? 'Yes' : 'No']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    return encodeURI(csvContent);
  }
}

window.ApiService = ApiService;
