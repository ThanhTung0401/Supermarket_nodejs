import * as inventoryService from './inventory.service.js';

// Nhập hàng
export const importGoods = async (req, res, next) => {
    try {
        const receipt = await inventoryService.createImportReceipt(req.body, req.user.id);
        res.status(201).json({
            message: 'Nhập hàng thành công',
            data: receipt,
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách phiếu nhập
export const getImportHistory = async (req, res, next) => {
    try {
        const result = await inventoryService.getImportReceipts(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Chi tiết phiếu nhập
export const getReceiptDetail = async (req, res, next) => {
    try {
        const result = await inventoryService.getImportReceiptById(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Trạng thái kho (Tồn kho, Cảnh báo)
export const getStockStatus = async (req, res, next) => {
    try {
        const result = await inventoryService.getInventoryStatus(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Điều chỉnh kho
export const adjustStock = async (req, res, next) => {
    try {
        const result = await inventoryService.adjustStock(req.body, req.user.id);
        res.json({
            message: 'Điều chỉnh kho thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Lịch sử xuất nhập tồn (Logs)
export const getStockLogs = async (req, res, next) => {
    try {
        const result = await inventoryService.getStockLogs(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
