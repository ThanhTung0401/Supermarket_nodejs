import axiosClient from './axiosClient';

const customerApi = {
    getAll(params) {
        const url = '/customers';
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/customers/${id}`;
        return axiosClient.get(url);
    },

    getHistory(id) {
        const url = `/customers/${id}/invoices`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = '/customers';
        return axiosClient.post(url, data);
    },

    update(id, data) {
        const url = `/customers/${id}`;
        return axiosClient.patch(url, data);
    },

    remove(id) {
        const url = `/customers/${id}`;
        return axiosClient.delete(url);
    }
};

export default customerApi;