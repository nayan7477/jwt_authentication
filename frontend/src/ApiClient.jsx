import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let refreshPromise = null;

apiClient.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = apiClient.post('/auth/refresh').finally(() => {
                    refreshPromise = null;
                });
            }

            await refreshPromise;

            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);

export default apiClient;
