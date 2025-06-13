import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/apiClient';

export const useApi = () => {
    const { user, refreshToken } = useAuth();

    const makeRequest = async (config) => {
        try {
            return await apiClient(config);
        } catch (error) {
            if (error.response?.status === 401) {
                // Token might be expired, try to refresh
                try {
                    await refreshToken(true);
                    // Retry the original request
                    return await apiClient(config);
                } catch (refreshError) {
                    throw refreshError;
                }
            }
            throw error;
        }
    };

    return {
        get: (url, config = {}) => makeRequest({ ...config, method: 'GET', url }),
        post: (url, data, config = {}) => makeRequest({ ...config, method: 'POST', url, data }),
        put: (url, data, config = {}) => makeRequest({ ...config, method: 'PUT', url, data }),
        delete: (url, config = {}) => makeRequest({ ...config, method: 'DELETE', url }),
        patch: (url, data, config = {}) => makeRequest({ ...config, method: 'PATCH', url, data }),
    };
};
