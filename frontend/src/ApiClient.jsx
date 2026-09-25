import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                await apiClient.post('/auth/refresh');
                return apiClient(error.config);
            } catch (error) {
                window.location.href = '/loginform';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
