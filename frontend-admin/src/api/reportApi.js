import axiosClient from './axiosClient';

const reportApi = {
    getDashboardStats() {
        return axiosClient.get('/reports/dashboard');
    },
    getRevenueChart(params) { // Thêm params
        return axiosClient.get('/reports/revenue-chart', { params });
    },
    getTopSelling() {
        return axiosClient.get('/reports/top-selling');
    },
    getLowStock() {
        return axiosClient.get('/reports/low-stock');
    }
};

export default reportApi;