
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/'; // Cambia el puerto si tu backend usa otro

const axiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

export default axiosInstance;
