import axiosClient from './axiosClient';

const authApi = {
    login(data) {
        const url = '/auth/user/login';
        return axiosClient.post(url, data);
    },
    
    getMe() {
        // Nếu có API lấy thông tin user hiện tại
        // const url = '/auth/user/me';
        // return axiosClient.get(url);
    }
};

export default authApi;