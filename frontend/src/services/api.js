import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding auth token to request:', config.method?.toUpperCase(), config.url);
    } else {
      console.log('⚠️ No auth token found for request:', config.method?.toUpperCase(), config.url);
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
                'Status:', response.status, 'Data length:', 
                Array.isArray(response.data) ? response.data.length : 'N/A');
    return response;
  },
  (error) => {
    // ✅ 6. Check Network/API Call on Frontend - Detailed error logging
    console.error('❌ API ERROR DETAILS:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // ✅ 5. Check if Token Is Required
    if (error.response?.status === 401) {
      console.error('🚫 AUTHENTICATION ERROR: Token missing or expired');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
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
      
      // ✅ 10. Frontend Error Logging - Check token before request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const url = `/rooming-lists${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🌐 Making request to:', url);
      
      const response = await api.get(url);
      
      // ✅ Additional validation
      if (!Array.isArray(response.data)) {
        console.error('❌ UNEXPECTED RESPONSE FORMAT: Expected array, got:', typeof response.data, response.data);
        throw new Error('Invalid response format from server');
      }

      console.log('✅ Successfully fetched', response.data.length, 'rooming lists');
      return response;
    } catch (error) {
      // ✅ 10. Frontend Error Logging - Detailed fetch error
      if (error.response) {
        // Server responded with error status
        console.error('❌ SERVER ERROR RESPONSE:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // Request was made but no response received
        console.error('❌ NO RESPONSE FROM SERVER:', {
          request: error.request,
          message: 'Server did not respond - check if backend is running on port 3001'
        });
      } else {
        // Something else happened
        console.error('❌ REQUEST SETUP ERROR:', error.message);
      }
      
      throw error;
    }
  },

  getById: (id) => api.get(`/rooming-lists/${id}`),
  getBookings: async (roomingListId) => {
    try {
      console.log('📊 Fetching bookings for rooming list:', roomingListId);
      const response = await api.get(`/rooming-lists/${roomingListId}/bookings`);
      console.log('✅ Successfully fetched', response.data.length, 'bookings');
      return response;
    } catch (error) {
      console.error('❌ FAILED to fetch bookings for rooming list:', roomingListId, error.response?.data || error.message);
      throw error;
    }
  },
  create: (data) => api.post('/rooming-lists', data),
  update: (id, data) => api.put(`/rooming-lists/${id}`, data),
  delete: (id) => api.delete(`/rooming-lists/${id}`),
};

// Data Management API
export const dataAPI = {
  insertSampleData: async () => {
    try {
      console.log('🌱 Inserting sample data...');
      const response = await api.post('/data/insert-sample-data');
      console.log('✅ Sample data inserted successfully');
      return response;
    } catch (error) {
      console.error('❌ FAILED to insert sample data:', error.response?.data || error.message);
      throw error;
    }
  },
  clearAll: () => api.delete('/data/clear-all'),
};

export default api; 