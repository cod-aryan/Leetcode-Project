import axios from 'axios';


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Include cookies for authentication
});

export default axiosClient;