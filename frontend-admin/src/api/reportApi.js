import axiosClient from './axiosClient';

const reportApi = {
    getDashboardStats() {
        return axiosClient.get('/reports/dashboard');
    },
    getRevenueChart() {
        return axiosClient.get('/reports/revenue-chart');
    },
    getTopSelling() {
        return axiosClient.get('/reports/top-selling');
    },
    getLowStock() {
        return axiosClient.get('/reports/low-stock');
    }
};

export default reportApi;