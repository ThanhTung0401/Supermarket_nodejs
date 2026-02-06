import axiosClient from './axiosClient';

const productApi = {
    // --- Products ---
    getAll(params) {
        const url = '/products';
        return axiosClient.get(url, { params });
    },
    get(id) {
        const url = `/products/${id}`;
        return axiosClient.get(url);
    },
    add(data) {
        const url = '/products';
        return axiosClient.post(url, data);
    },
    update(id, data) {
        const url = `/products/${id}`;
        return axiosClient.patch(url, data);
    },
    remove(id) {
        const url = `/products/${id}`;
        return axiosClient.delete(url);
    },
    
    // --- Categories ---
    getCategories() {
        const url = '/products/categories';
        return axiosClient.get(url);
    },
    addCategory(data) {
        const url = '/products/categories';
        return axiosClient.post(url, data);
    },
    updateCategory(id, data) {
        const url = `/products/categories/${id}`;
        return axiosClient.patch(url, data);
    },
    removeCategory(id) {
        const url = `/products/categories/${id}`;
        return axiosClient.delete(url);
    }
};

export default productApi;