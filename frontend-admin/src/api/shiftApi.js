import axiosClient from './axiosClient';

const shiftApi = {
    getAll(params) {
        const url = '/sales/shift';
        return axiosClient.get(url, { params });
    },

    getCurrent() {
        const url = '/sales/shift/current';
        return axiosClient.get(url);
    },

    start(data) {
        const url = '/sales/shift/start';
        return axiosClient.post(url, data);
    },

    end(data) {
        const url = '/sales/shift/end';
        return axiosClient.post(url, data);
    }
};

export default shiftApi;