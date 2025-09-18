import axios from 'axios';

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL as string;

const axiosInstance = axios.create({ baseURL: baseUrl });

export default axiosInstance;
