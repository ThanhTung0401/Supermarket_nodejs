import axiosClient from './axiosClient';

const voucherApi = {
    getAll(params) {
        const url = '/marketing/vouchers';
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/marketing/vouchers/${id}`;
        return axiosClient.get(url);
    },

    create(data) {
        const url = '/marketing/vouchers';
        return axiosClient.post(url, data);
    },

    update(id, data) {
        const url = `/marketing/vouchers/${id}`;
        return axiosClient.put(url, data); // Backend dùng PUT
    },

    delete(id) {
        const url = `/marketing/vouchers/${id}`;
        return axiosClient.delete(url);
    }
};

export default voucherApi;