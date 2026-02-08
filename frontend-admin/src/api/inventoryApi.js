import axiosClient from './axiosClient';

const inventoryApi = {
    // Lấy lịch sử nhập hàng
    getImportReceipts(params) {
        const url = '/inventory/import';
        return axiosClient.get(url, { params });
    },

    // Lấy chi tiết phiếu nhập
    getImportReceiptDetail(id) {
        const url = `/inventory/import/${id}`;
        return axiosClient.get(url);
    },

    // Tạo phiếu nhập mới
    createImportReceipt(data) {
        const url = '/inventory/import';
        return axiosClient.post(url, data);
    },

    // Lấy trạng thái kho (Tồn kho)
    getStockStatus(params) {
        const url = '/inventory/status';
        return axiosClient.get(url, { params });
    },

    // Lấy lịch sử biến động kho (Logs)
    getStockLogs(params) {
        const url = '/inventory/logs';
        return axiosClient.get(url, { params });
    },

    // Điều chỉnh kho (Kiểm kê/Hủy)
    adjustStock(data) {
        const url = '/inventory/adjust';
        return axiosClient.post(url, data);
    }
};

export default inventoryApi;