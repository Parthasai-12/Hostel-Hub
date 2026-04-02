import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://hostel-hub-production.up.railway.app';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Token expired or unauthorized
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userName');
                window.location.href = '/'; // Redirect to landing
            } else if (error.response.status === 403) {
                alert('Access Denied: You do not have permission to perform this action.');
            }
        }
        return Promise.reject(error);
    }
);

export default api;


