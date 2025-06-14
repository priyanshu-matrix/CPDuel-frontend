import axios from 'axios';
import { auth } from './firebase/firebase';
import { getApiBaseUrl } from '../config/server';

// Create axios instance
const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            if (auth.currentUser) {
                // Always get a fresh token for API calls
                const token = await auth.currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
                
                // Update localStorage with the fresh token
                localStorage.setItem('token', token);
            }
        } catch (error) {
            console.error('Error getting token for request:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (auth.currentUser) {
                    // Force refresh the token
                    const newToken = await auth.currentUser.getIdToken(true);
                    localStorage.setItem('token', newToken);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Redirect to login if refresh fails
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
