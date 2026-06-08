import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:80/estrada_closet_be/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use((config) => {
    try {
        const stored = localStorage.getItem('auth');
        if (stored) {
            const { token } = JSON.parse(stored);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch {
    }
    return config;
});