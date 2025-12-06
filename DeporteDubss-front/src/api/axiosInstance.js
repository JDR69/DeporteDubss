
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/'; // Cambia el puerto si tu backend usa otro

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add a request interceptor to include the JWT token in all requests
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		
		// If the error is 401 and we haven't retried yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			
			try {
				const refreshToken = localStorage.getItem('refresh_token');
				if (refreshToken) {
					const response = await axios.post(`${BASE_URL}api/token/refresh/`, {
						refresh: refreshToken
					});
					
					const { access } = response.data;
					localStorage.setItem('access_token', access);
					
					// Retry the original request with the new token
					originalRequest.headers.Authorization = `Bearer ${access}`;
					return axiosInstance(originalRequest);
				}
			} catch (refreshError) {
				// If refresh fails, redirect to login
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				window.location.href = '/';
				return Promise.reject(refreshError);
			}
		}
		
		return Promise.reject(error);
	}
);

export default axiosInstance;
