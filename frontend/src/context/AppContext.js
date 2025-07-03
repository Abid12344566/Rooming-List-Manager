import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, roomingListsAPI, dataAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

const initialState = {
  // Auth state (optional for now)
  user: null,
  isAuthenticated: true, // Set to true for no-auth mode
  isLoading: false,
  
  // Rooming lists state
  roomingLists: [],
  filteredRoomingLists: [],
  isLoadingRoomingLists: false,
  
  // Bookings modal state
  showBookingsModal: false,
  selectedRoomingList: null,
  bookings: [],
  isLoadingBookings: false,
  
  // Filters and search
  filters: {
    status: 'all',
    search: '',
    sortBy: 'cutOffDate',
    sortOrder: 'asc'
  },
  
  // UI state
  showLoginModal: false,
  showRegisterModal: false,
};

const actionTypes = {
  // Auth actions
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SHOW_LOGIN_MODAL: 'SHOW_LOGIN_MODAL',
  SHOW_REGISTER_MODAL: 'SHOW_REGISTER_MODAL',
  HIDE_MODALS: 'HIDE_MODALS',
  
  // Rooming lists actions
  SET_LOADING_ROOMING_LISTS: 'SET_LOADING_ROOMING_LISTS',
  SET_ROOMING_LISTS: 'SET_ROOMING_LISTS',
  SET_FILTERED_ROOMING_LISTS: 'SET_FILTERED_ROOMING_LISTS',
  
  // Bookings modal actions
  SHOW_BOOKINGS_MODAL: 'SHOW_BOOKINGS_MODAL',
  HIDE_BOOKINGS_MODAL: 'HIDE_BOOKINGS_MODAL',
  SET_LOADING_BOOKINGS: 'SET_LOADING_BOOKINGS',
  SET_BOOKINGS: 'SET_BOOKINGS',
  
  // Filter actions
  SET_SEARCH: 'SET_SEARCH',
  SET_STATUS_FILTER: 'SET_STATUS_FILTER',
  SET_SORT: 'SET_SORT',
};

const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
      
    case actionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        isAuthenticated: true, // Keep authenticated in no-auth mode
        roomingLists: [],
        filteredRoomingLists: []
      };
      
    case actionTypes.SHOW_LOGIN_MODAL:
      return { ...state, showLoginModal: true, showRegisterModal: false };
      
    case actionTypes.SHOW_REGISTER_MODAL:
      return { ...state, showRegisterModal: true, showLoginModal: false };
      
    case actionTypes.HIDE_MODALS:
      return { ...state, showLoginModal: false, showRegisterModal: false, showBookingsModal: false };
      
    case actionTypes.SET_LOADING_ROOMING_LISTS:
      return { ...state, isLoadingRoomingLists: action.payload };
      
    case actionTypes.SET_ROOMING_LISTS:
      return {
        ...state,
        roomingLists: action.payload,
        isLoadingRoomingLists: false
      };
      
    case actionTypes.SET_FILTERED_ROOMING_LISTS:
      return {
        ...state,
        filteredRoomingLists: action.payload
      };

    case actionTypes.SHOW_BOOKINGS_MODAL:
      return {
        ...state,
        showBookingsModal: true,
        selectedRoomingList: action.payload.roomingList,
        bookings: action.payload.bookings,
        isLoadingBookings: false
      };

    case actionTypes.HIDE_BOOKINGS_MODAL:
      return {
        ...state,
        showBookingsModal: false,
        selectedRoomingList: null,
        bookings: [],
        isLoadingBookings: false
      };

    case actionTypes.SET_LOADING_BOOKINGS:
      return { ...state, isLoadingBookings: action.payload };

    case actionTypes.SET_BOOKINGS:
      return { ...state, bookings: action.payload, isLoadingBookings: false };
      
    case actionTypes.SET_SEARCH:
      return { ...state, filters: { ...state.filters, search: action.payload } };
      
    case actionTypes.SET_STATUS_FILTER:
      return { ...state, filters: { ...state.filters, status: action.payload } };
      
    case actionTypes.SET_SORT:
      return {
        ...state,
        filters: {
          ...state.filters,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder
        }
      };
      
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const applyFilters = useCallback(() => {
    console.log('🔍 Applying filters to', state.roomingLists.length, 'rooming lists');
    let filtered = [...state.roomingLists];

    // Apply status filter
    if (state.filters.status !== 'all') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(rl => rl.status === state.filters.status);
      console.log('🏷️ Status filter applied:', state.filters.status, 'reduced from', beforeCount, 'to', filtered.length);
    }

    // Apply search filter
    if (state.filters.search) {
      const beforeCount = filtered.length;
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(rl =>
        rl.eventName?.toLowerCase().includes(searchLower) ||
        rl.rfpName?.toLowerCase().includes(searchLower) ||
        rl.agreement_type?.toLowerCase().includes(searchLower)
      );
      console.log('🔍 Search filter applied:', state.filters.search, 'reduced from', beforeCount, 'to', filtered.length);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (state.filters.sortBy === 'cutOffDate') {
        const dateA = new Date(a.cutOffDate);
        const dateB = new Date(b.cutOffDate);
        return state.filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    console.log('✅ Final filtered results:', filtered.length, 'rooming lists');
    dispatch({ type: actionTypes.SET_FILTERED_ROOMING_LISTS, payload: filtered });
  }, [state.roomingLists, state.filters.status, state.filters.search, state.filters.sortBy, state.filters.sortOrder]);

  // Fetch rooming lists function
  const fetchRoomingLists = useCallback(async () => {
    try {
      console.log('📋 Starting to fetch rooming lists...');
      dispatch({ type: actionTypes.SET_LOADING_ROOMING_LISTS, payload: true });
      
      const response = await roomingListsAPI.getAll();
      
      console.log('✅ Rooming lists fetched successfully:', response.data.length, 'items');
      dispatch({ type: actionTypes.SET_ROOMING_LISTS, payload: response.data });
      
    } catch (error) {
      console.error('❌ Failed to fetch rooming lists:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      dispatch({ type: actionTypes.SET_LOADING_ROOMING_LISTS, payload: false });
      
      const message = error.response?.data?.error || error.message || 'Failed to fetch rooming lists';
      toast.error(message);
    }
  }, []);

  // Initialize app and fetch data on mount
  useEffect(() => {
    console.log('🚀 Initializing app - fetching rooming lists automatically');
    const token = localStorage.getItem('token');
    console.log('🔐 Checking for existing auth token:', token ? 'Found' : 'Not found');
    
    if (token) {
      dispatch({ type: actionTypes.SET_USER, payload: { authenticated: true } });
    }
    
    // Automatically fetch rooming lists since no auth is required
    fetchRoomingLists();
  }, [fetchRoomingLists]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // API functions
  const logout = useCallback(() => {
    console.log('🚪 Logging out user');
    dispatch({ type: actionTypes.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 Starting login process...');
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await authAPI.login(credentials);
      
      localStorage.setItem('token', response.data.token);
      dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
      dispatch({ type: actionTypes.HIDE_MODALS });
      
      toast.success('Login successful!');
      console.log('✅ Login completed successfully');
      
      // Refresh data after login
      fetchRoomingLists();
      
      return response.data;
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const message = error.response?.data?.error || error.message || 'Login failed';
      console.error('❌ Login failed:', message);
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Starting registration process...');
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await authAPI.register(userData);
      
      localStorage.setItem('token', response.data.token);
      dispatch({ type: actionTypes.SET_USER, payload: response.data.user });
      dispatch({ type: actionTypes.HIDE_MODALS });
      
      toast.success('Registration successful!');
      console.log('✅ Registration completed successfully');
      
      // Refresh data after registration
      fetchRoomingLists();
      
      return response.data;
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const message = error.response?.data?.error || error.message || 'Registration failed';
      console.error('❌ Registration failed:', message);
      toast.error(message);
      throw error;
    }
  };

  const fetchBookings = useCallback(async (roomingListId, roomingList = null) => {
    try {
      console.log('📊 Fetching bookings for rooming list:', roomingListId);
      
      if (roomingList) {
        dispatch({ type: actionTypes.SET_LOADING_BOOKINGS, payload: true });
      }
      
      const response = await roomingListsAPI.getBookings(roomingListId);
      console.log('✅ Bookings fetched successfully:', response.data.length, 'items');
      
      if (roomingList) {
        // Show in modal
        dispatch({ 
          type: actionTypes.SHOW_BOOKINGS_MODAL, 
          payload: { 
            roomingList, 
            bookings: response.data 
          } 
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error.response?.data || error.message);
      
      if (roomingList) {
        dispatch({ type: actionTypes.SET_LOADING_BOOKINGS, payload: false });
      }
      
      toast.error('Failed to fetch bookings');
      throw error;
    }
  }, []);

  const insertSampleData = useCallback(async () => {
    try {
      console.log('🌱 Starting sample data insertion...');
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      await dataAPI.insertSampleData();
      
      console.log('✅ Sample data inserted successfully');
      toast.success('Sample data inserted successfully!');
      
      // Refresh the rooming lists
      await fetchRoomingLists();
      
    } catch (error) {
      console.error('❌ Failed to insert sample data:', error.response?.data || error.message);
      const message = error.response?.data?.error || error.message || 'Failed to insert sample data';
      toast.error(message);
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, [fetchRoomingLists]);

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    fetchRoomingLists,
    fetchBookings,
    insertSampleData,
    
    // UI actions
    openLoginModal: () => dispatch({ type: actionTypes.SHOW_LOGIN_MODAL }),
    openRegisterModal: () => dispatch({ type: actionTypes.SHOW_REGISTER_MODAL }),
    hideModals: () => dispatch({ type: actionTypes.HIDE_MODALS }),
    hideBookingsModal: () => dispatch({ type: actionTypes.HIDE_BOOKINGS_MODAL }),
    
    // Filter actions
    setSearch: (search) => dispatch({ type: actionTypes.SET_SEARCH, payload: search }),
    setStatusFilter: (status) => dispatch({ type: actionTypes.SET_STATUS_FILTER, payload: status }),
    setSort: (sortBy, sortOrder) => dispatch({ type: actionTypes.SET_SORT, payload: { sortBy, sortOrder } }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 