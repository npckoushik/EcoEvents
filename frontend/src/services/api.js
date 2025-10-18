import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/vendor/my-products'),
  getContact: (id) => api.post(`/products/${id}/contact`),
};

// Donations API
export const donationsAPI = {
  getDonations: (params) => api.get('/donations', { params }),
  getDonation: (id) => api.get(`/donations/${id}`),
  createDonation: (donationData) => api.post('/donations', donationData),
  updateDonation: (id, donationData) => api.put(`/donations/${id}`, donationData),
  deleteDonation: (id) => api.delete(`/donations/${id}`),
  requestDonation: (id) => api.post(`/donations/${id}/request`),
  confirmDonation: (id) => api.post(`/donations/${id}/confirm`),
  completeDonation: (id, data) => api.post(`/donations/${id}/complete`, data),
  ngoCompleteDonation: (id, data) => api.post(`/donations/${id}/ngo-complete`, data),
  getMyDonations: () => api.get('/donations/vendor/my-donations'),
  getMyRequests: () => api.get('/donations/ngo/my-requests'),
};

// Users API
export const usersAPI = {
  getNearbyVendors: (params) => api.get('/users/vendors/nearby', { params }),
  getNearbyNGOs: (params) => api.get('/users/ngos/nearby', { params }),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  getUserStats: (id) => api.get(`/users/${id}/stats`),
};

// Dashboard API
export const dashboardAPI = {
  // Get customer dashboard stats
  getCustomerStats: () => api.get('/dashboard/customer/stats'),
  
  // Get vendor dashboard stats  
  getVendorStats: () => api.get('/dashboard/vendor/stats'),
  
  // Get NGO dashboard stats
  getNGOStats: () => api.get('/dashboard/ngo/stats'),
};

// Stream Chat API
export const streamAPI = {
  getToken: () => api.post('/stream/token'),
  createChannel: (channelData) => api.post('/stream/channel', channelData),
};

// Utility functions
export const getLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${Math.round(distance * 10) / 10}km`;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
};
