import axios from 'axios';

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL as string;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  validateStatus: (status) => status >= 200 && status < 500,
});

export default axiosInstance;
