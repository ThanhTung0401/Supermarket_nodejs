import axiosClient from './axiosClient';

const authApi = {
    register(data) {
        const url = '/auth/customer/register';
        return axiosClient.post(url, data);
    },

    login(data) {
        const url = '/auth/customer/login';
        return axiosClient.post(url, data);
    },

    getMe() {
        const url = '/customer/profile/me';
        return axiosClient.get(url);
    }
};

export default authApi;