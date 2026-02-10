import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor cho Request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('customer_token'); // Dùng key khác với Admin
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor cho Response
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Xử lý logout nếu token hết hạn
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_info');
            // Có thể redirect hoặc hiện modal login
        }
        return Promise.reject(error);
    }
);

export default axiosClient;