import axiosClient from './axiosClient';

const orderApi = {
    getAll(params) {
        const url = '/orders';
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/orders/${id}`;
        return axiosClient.get(url);
    },

    updateStatus(id, status) {
        const url = `/orders/${id}/status`;
        return axiosClient.patch(url, { status });
    }
};

export default orderApi;