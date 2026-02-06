import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Cập nhật đúng port và path của Backend
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
        // Trả về response.data để lấy trực tiếp body JSON từ server
        // Ví dụ: { status: 'success', data: {...} }
        return response.data; 
    },
    (error) => {
        const { response } = error;
        
        if (response && response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
            
            // Chỉ redirect nếu không phải đang ở trang login để tránh loop
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Ném lỗi ra để component xử lý tiếp (hiển thị thông báo...)
        return Promise.reject(error);
    }
);

export default axiosClient;