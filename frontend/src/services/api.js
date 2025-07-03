import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token (optional for now)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding auth token to request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API SUCCESS:', response.config.method?.toUpperCase(), response.config.url, 
                'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ API ERROR DETAILS:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Handle authentication errors (optional)
    if (error.response?.status === 401) {
      console.error('🚫 AUTHENTICATION ERROR: Token missing or expired');
      localStorage.removeItem('token');
      // Don't redirect to login for now since auth is optional
    }

    return Promise.reject(error);
  }
);

// Auth API (optional for now)
export const authAPI = {
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login for username:', credentials.username);
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful, received token');
      return response;
    } catch (error) {
      console.error('❌ LOGIN FAILED:', {
        username: credentials.username,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('📝 Attempting registration for username:', userData.username);
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ REGISTRATION FAILED:', {
        username: userData.username,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
};

// Rooming Lists API
export const roomingListsAPI = {
  getAll: async (filters = {}) => {
    try {
      console.log('📋 Fetching rooming lists with filters:', filters);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const url = `/rooming-lists${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🌐 Making request to:', url);
      
      const response = await api.get(url);
      
      // Handle new response format with status/data structure
      const data = response.data.data || response.data;
      
      if (!Array.isArray(data)) {
        console.error('❌ UNEXPECTED RESPONSE FORMAT: Expected array, got:', typeof data, data);
        throw new Error('Invalid response format from server');
      }

      console.log('✅ Successfully fetched', data.length, 'rooming lists');
      return { ...response, data };
    } catch (error) {
      console.error('❌ FAILED to fetch rooming lists:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/rooming-lists/${id}`);
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to fetch rooming list:', id, error.response?.data || error.message);
      throw error;
    }
  },

  getBookings: async (roomingListId) => {
    try {
      console.log('📊 Fetching bookings for rooming list:', roomingListId);
      const response = await api.get(`/rooming-lists/${roomingListId}/bookings`);
      const data = response.data.data || response.data;
      console.log('✅ Successfully fetched', data.length, 'bookings for rooming list', roomingListId);
      console.log('📝 Bookings:', data); // Log to console as requested
      return { ...response, data };
    } catch (error) {
      console.error('❌ FAILED to fetch bookings for rooming list:', roomingListId, error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/rooming-lists', data);
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to create rooming list:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/rooming-lists/${id}`, data);
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to update rooming list:', id, error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/rooming-lists/${id}`);
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to delete rooming list:', id, error.response?.data || error.message);
      throw error;
    }
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/bookings');
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to fetch bookings:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to fetch booking:', id, error.response?.data || error.message);
      throw error;
    }
  }
};

// Data Management API
export const dataAPI = {
  insertSampleData: async () => {
    try {
      console.log('🌱 Inserting sample data from JSON files...');
      console.log('⚠️ This will clear all existing data and reload from JSON files');
      const response = await api.post('/data/insert');
      console.log('✅ Sample data inserted successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ FAILED to insert sample data:', error.response?.data || error.message);
      throw error;
    }
  },

  clearAll: async () => {
    try {
      console.log('🗑️ Clearing all data...');
      const response = await api.delete('/data/clear');
      console.log('✅ All data cleared successfully');
      return response;
    } catch (error) {
      console.error('❌ FAILED to clear data:', error.response?.data || error.message);
      throw error;
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/data/status');
      return { ...response, data: response.data.data || response.data };
    } catch (error) {
      console.error('❌ FAILED to get data status:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default api; 