// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Form helpers
export const getFormData = (formData) => {
  const data = new FormData();
  Object.keys(formData).forEach(key => {
    if (formData[key] !== null && formData[key] !== undefined) {
      data.append(key, formData[key]);
    }
  });
  return data;
};

// Image helpers
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
};

// Category helpers
export const getCategoryIcon = (category) => {
  const icons = {
    food: '🍎',
    attire: '👕',
    decor: '🏠',
    lighting: '💡',
    flowers: '🌸',
    other: '📦'
  };
  return icons[category] || '📦';
};

export const getCategoryColor = (category) => {
  const colors = {
    food: 'bg-orange-100 text-orange-800',
    attire: 'bg-blue-100 text-blue-800',
    decor: 'bg-purple-100 text-purple-800',
    lighting: 'bg-yellow-100 text-yellow-800',
    flowers: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// Status helpers
export const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-800',
    requested: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    picked_up: 'bg-orange-100 text-orange-800',
    completed: 'bg-purple-100 text-purple-800',
    expired: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status) => {
  const texts = {
    available: 'Available',
    requested: 'Requested',
    confirmed: 'Confirmed',
    picked_up: 'Picked Up',
    completed: 'Completed',
    expired: 'Expired'
  };
  return texts[status] || status;
};

// Role helpers
export const getRoleDisplayName = (role) => {
  const names = {
    customer: 'Customer',
    vendor: 'Vendor',
    ngo: 'NGO'
  };
  return names[role] || role;
};

export const getRoleColor = (role) => {
  const colors = {
    customer: 'bg-blue-100 text-blue-800',
    vendor: 'bg-green-100 text-green-800',
    ngo: 'bg-purple-100 text-purple-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

// Search and filter helpers
export const filterItems = (items, searchTerm, filters = {}) => {
  let filtered = items;

  // Text search
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(term) ||
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(item => item.category === filters.category);
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(item => item.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(item => item.price <= filters.maxPrice);
  }

  // Distance filter
  if (filters.maxDistance !== undefined) {
    filtered = filtered.filter(item => 
      !item._distance || item._distance <= filters.maxDistance
    );
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(item => item.status === filters.status);
  }

  return filtered;
};

export const sortItems = (items, sortBy, sortOrder = 'asc') => {
  return [...items].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'distance':
        aValue = a._distance || Infinity;
        bValue = b._distance || Infinity;
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'score':
        aValue = a.donationScore || 0;
        bValue = b.donationScore || 0;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

// Local storage helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Error handling helpers
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleApiError = (error, defaultMessage = 'Something went wrong') => {
  const message = getErrorMessage(error);
  console.error('API Error:', error);
  return message || defaultMessage;
};

// Distance formatting helper
export const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return '';
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};
