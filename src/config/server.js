// Backend API configuration
// Exports REACT_APP_API_URL from .env for Vite/React

// Safe environment variable access for Vite
const getEnvVar = (name, fallback = '') => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[name] || fallback;
    }
    return fallback;
};

// Export the base API URL from environment variables
export const API_BASE_URL = getEnvVar('VITE_API_URL', 'http://localhost:3000');
export const API_URL = `${API_BASE_URL}/api`;

// For compatibility with REACT_APP_API_URL (if using Create React App format)
export const REACT_APP_API_URL = getEnvVar('VITE_API_URL', '') || 
                                  getEnvVar('REACT_APP_API_URL', '') || 
                                  'http://localhost:3000';

// Socket URL
export const SOCKET_URL = getEnvVar('VITE_SOCKET_URL', '') || 
                          getEnvVar('REACT_APP_SOCKET_URL', '') || 
                          'http://localhost:3000';

// Helper functions
export const getApiBaseUrl = () => API_URL;
export const getSocketUrl = () => SOCKET_URL;
export const getBaseUrl = () => API_BASE_URL;

// API URLs - Using the exported REACT_APP_API_URL
export const API_URLS = {
    // User endpoints
    USERS: {
        SIGNUP: `${API_URL}/users/signup`,
        LOGIN: `${API_URL}/users/login`,
        INFO: `${API_URL}/users/info`,
        ALL: `${API_URL}/users/all`,
        GET_BY_UID: `${API_URL}/users/getUserByUid`,
        CHANGE_STATUS: `${API_URL}/users/changeUserStatus`,
        REGISTER_CONTEST: `${API_URL}/users/registerContest`,
        CHECK_CONTEST_REGISTRATION: (contestId) => `${API_URL}/users/checkContestRegistration/${contestId}`
    },
    
    // Contest endpoints
    CONTESTS: {
        ADD: `${API_URL}/contests/add`,
        GET_ALL: `${API_URL}/contests/getall`,
        GET_BY_ID: (contestId) => `${API_URL}/contests/getcon/${contestId}`,
        EDIT: (contestId) => `${API_URL}/contests/edit/${contestId}`,
        DELETE: (contestId) => `${API_URL}/contests/delete/${contestId}`,
        ADD_PROBLEM: `${API_URL}/contests/addProblemToContest`,
        REMOVE_PROBLEM: `${API_URL}/contests/removeProblemFromContest`,
        GET_CONTEST_PROBLEMS: (contestId) => `${API_URL}/contests/getContestProblems/${contestId}`,
        GET_USER_MATCH_INFO: `${API_URL}/contests/getUserMatchInfo`,
        START_CONTEST: `${API_URL}/contests/startContest`,
        UPDATE_MATCH_WINNER: `${API_URL}/contests/updateMatchWinner`
    },
    
    // Problem endpoints
    PROBLEMS: {
        ADD: `${API_URL}/problems/add`,
        GET_ALL: `${API_URL}/problems/getall`,
        GET: `${API_URL}/problems/get`,
        EDIT: `${API_URL}/problems/edit`,
        DELETE: `${API_URL}/problems/delete`
    },
    
    // Compiler endpoints
    COMPILER: {
        SUBMIT_CODE: `${API_URL}/compiler/submitCode`
    },

    TESTCASE: {
        DELETE_BY_PROBLEM_ID: `${API_URL}/testcases/delete`,
    }
};

// Default export
export default API_URLS;
