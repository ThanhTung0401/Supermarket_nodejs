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
        const url = '/store/orders';
        return axiosClient.get(url);
    },

    getCategories() { // Thêm API lấy danh mục cho Store
        const url = '/store/products'; // Tạm thời chưa có API riêng lấy category public, dùng tạm hoặc tạo mới
        // Tuy nhiên, tốt nhất là tạo API riêng.
        // Ở đây tôi sẽ dùng API của Admin nếu nó public, hoặc tạo mới.
        // Kiểm tra lại routes.js của Admin -> /products/categories cần login.
        // Vậy ta cần tạo thêm API public lấy category.
        return axiosClient.get('/store/categories'); // Giả định sẽ tạo route này
    }
};

export default storeApi;