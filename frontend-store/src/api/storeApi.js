import axiosClient from './axiosClient';

const storeApi = {
    getProducts(params) {
        const url = '/store/products';
        return axiosClient.get(url, { params });
    },

    getProductDetail(id) {
        const url = `/store/products/${id}`;
        return axiosClient.get(url);
    },

    createOrder(data) {
        const url = '/store/orders';
        return axiosClient.post(url, data);
    },

    getMyOrders() {
        // Sửa lại đường dẫn cho khớp với Backend (/api/store/orders)
        const url = '/store/orders';
        return axiosClient.get(url);
    }
};

export default storeApi;