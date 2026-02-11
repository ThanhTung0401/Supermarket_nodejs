import axios from 'axios';

// Tự động chọn URL:
// - Nếu có biến môi trường VITE_API_URL (khi deploy) -> Dùng nó.
// - Nếu không -> Dùng localhost (khi chạy dev).
const baseURL = 'http://localhost:8080/api';

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động thêm Token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý lỗi chung
axiosClient.interceptors.response.use(
    (response) => {
        return response.data; 
    },
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;