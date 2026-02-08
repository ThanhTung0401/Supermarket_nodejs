import axiosClient from './axiosClient';

const userApi = {
    getAll(params) {
        const url = '/users';
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/users/${id}`;
        return axiosClient.get(url);
    },

    // Tạo nhân viên mới (Gọi sang Auth Module)
    create(data) {
        const url = '/auth/user/register';
        return axiosClient.post(url, data);
    },

    update(id, data) {
        const url = `/users/${id}`;
        return axiosClient.patch(url, data);
    },

    toggleActive(id) {
        const url = `/users/${id}/toggle-active`;
        return axiosClient.patch(url);
    },

    remove(id) {
        const url = `/users/${id}`;
        return axiosClient.delete(url);
    }
};

export default userApi;