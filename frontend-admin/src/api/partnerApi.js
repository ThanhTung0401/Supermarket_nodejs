import axiosClient from './axiosClient';

const partnerApi = {
    getAll(params) {
        const url = '/partners/suppliers';
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/partners/supplier/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = '/partners/supplier';
        return axiosClient.post(url, data);
    },

    update(id, data) {
        const url = `/partners/supplier/${id}`;
        return axiosClient.patch(url, data);
    },

    remove(id) {
        const url = `/partners/supplier/${id}`;
        return axiosClient.delete(url);
    }
};

export default partnerApi;