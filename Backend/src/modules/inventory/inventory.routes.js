import express from 'express';
import * as inventoryController from './inventory.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { restrictTo } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Tất cả endpoints đều cần đăng nhập
router.use(protect);

// 1. Quản lý nhập hàng
router.post(
    '/import',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'),
    inventoryController.importGoods
);
router.get(
    '/import',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'),
    inventoryController.getImportHistory
);
router.get(
    '/import/:id',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'),
    inventoryController.getReceiptDetail
);

// 2. Tra cứu tồn kho & Lịch sử
router.get(
    '/status',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER'), // Thu ngân cũng cần xem tồn kho để bán
    inventoryController.getStockStatus
);
router.get(
    '/logs',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'),
    inventoryController.getStockLogs
);

// 3. Điều chỉnh kho (Hư hỏng, Kiểm kê)
router.post(
    '/adjust',
    restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'), // Kho có thể kiểm kê, nhưng cần Manager duyệt (logic nâng cao), ở đây tạm cho Warehouse làm luôn.
    inventoryController.adjustStock
);

export default router;
