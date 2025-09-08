
//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080' || 'https://8080-daaadbdcecdccfdaaddfaeacedbcbafbecff.premiumproject.examly.io';

const API_BASE_URL = 'http://localhost:8080';
// Check if mock mode should be used
const shouldUseMockMode = () => {
    return process.env.REACT_APP_USE_MOCK === 'true';
};

// Generic API request function with enhanced debugging
const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    // Debug logging
    console.log('=== API REQUEST DEBUG ===');
    console.log('URL:', `${API_BASE_URL}${url}`);
    console.log('Method:', options.method || 'GET');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('User Role:', userRole);
    console.log('Username:', username);
    console.log('Mock Mode:', shouldUseMockMode());
    console.log('========================');

    // Use mock API only if explicitly enabled
    if (shouldUseMockMode()) {
        console.log('Using mock API mode');
        // Mock implementation would go here
        return Promise.resolve([]);
    }

    // Real API configuration
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Only add Authorization header if we have a token and it's not a mock token
    if (token && !token.startsWith('mock_token_')) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug the final config
    console.log('Request headers:', config.headers);
    console.log('Request body:', options.body);

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Handle different status codes
        if (response.status === 401) {
            console.log('401 Unauthorized - clearing auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            throw new Error('Unauthorized - Please login again');
        }

        if (response.status === 403) {
            console.log('403 Forbidden error');
            // Let's try without authorization header for debugging
            console.log('Retrying without authorization header...');

            const configWithoutAuth = {
                ...config,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            };
            delete configWithoutAuth.headers.Authorization;

            const retryResponse = await fetch(`${API_BASE_URL}${url}`, configWithoutAuth);
            console.log('Retry response status:', retryResponse.status);

            if (retryResponse.ok) {
                console.log('Request worked without auth header - there might be an auth issue');
                const contentType = retryResponse.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return await retryResponse.json();
                } else {
                    return {};
                }
            } else {
                console.log('Request failed even without auth header');
            }

            throw new Error('Forbidden - You do not have permission to perform this action');
        }

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        // Handle successful responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Success response data:', data);
            return data;
        } else {
            return {};
        }

    } catch (error) {
        console.error(`API call failed: ${options.method || 'GET'} ${url}`, error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Network error - Could not connect to backend at ${API_BASE_URL}. Please check if your backend server is running.`);
        }

        throw error;
    }
};

// Named exports for individual HTTP methods
export const apiGet = (url, options = {}) => {
    return apiRequest(url, { method: 'GET', ...options });
};

export const apiPost = (url, data, options = {}) => {
    return apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options,
    });
};

export const apiPut = (url, data, options = {}) => {
    return apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options,
    });
};

export const apiDelete = (url, options = {}) => {
    return apiRequest(url, { method: 'DELETE', ...options });
};

export const apiPatch = (url, data, options = {}) => {
    return apiRequest(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
        ...options,
    });
};

// Authentication API functions
export const authAPI = {
    login: async (credentials) => {
        try {
            console.log('Attempting login for:', credentials.username);

            // Only use mock authentication if mock mode is explicitly enabled
            if (shouldUseMockMode()) {
                const mockUsers = {
                    'admin': { password: 'admin123', role: 'ADMIN', username: 'admin' },
                    'sales': { password: 'sales123', role: 'SALES', username: 'sales' },
                    'user': { password: 'user123', role: 'USER', username: 'user' }
                };

                const user = mockUsers[credentials.username];
                if (user && user.password === credentials.password) {
                    return {
                        token: `mock_token_${Date.now()}`,
                        user: {
                            username: user.username,
                            role: user.role
                        }
                    };
                } else {
                    throw new Error('Invalid credentials');
                }
            }

            // Make real API call
            const response = await apiPost('/api/auth/login', credentials);
            console.log('Login response:', response);
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: (userData) => apiPost('/api/auth/register', userData),
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');

        return apiPost('/api/auth/logout').catch(() => { });
    },
    refreshToken: () => apiPost('/api/auth/refresh'),
    getCurrentUser: () => apiGet('/api/auth/me'),
    updateProfile: (profileData) => apiPut('/api/auth/profile', profileData),
    changePassword: (passwordData) => apiPut('/api/auth/password', passwordData),
    forgotPassword: (email) => apiPost('/api/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => apiPost('/api/auth/reset-password', { token, newPassword }),
    isAdmin: () => localStorage.getItem('userRole') === 'ADMIN'
};

// Customer API functions
export const customerAPI = {
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiGet(`/api/customers${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => apiGet(`/api/customers/${id}`),
    create: (customerData) => apiPost('/api/customers', customerData),
    update: (id, customerData) => apiPut(`/api/customers/${id}`, customerData),
    delete: (id) => apiDelete(`/api/customers/${id}`),
    search: (searchTerm) => apiGet(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`),
};

// Interaction API functions - FIXED UPDATE ENDPOINT
export const interactionAPI = {
    getAll: (customerId) => apiGet(`/api/customers/${customerId}/interactions`),
    getById: (interactionId) => apiGet(`/api/interactions/${interactionId}`),
    create: (interactionData) => apiPost('/api/interactions', interactionData),
    // FIXED: Now calls /api/interactions/{id} instead of customer-specific endpoint
    update: (interactionId, interactionData) => apiPut(`/api/interactions/${interactionId}`, interactionData),
    // FIXED: Now calls /api/interactions/{id} for delete as well
    delete: (interactionId) => apiDelete(`/api/interactions/${interactionId}`),
};

// Default export
const api = {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    apiPatch,
    authAPI,
    customerAPI,
    interactionAPI,
    request: apiRequest,
};

export default api;