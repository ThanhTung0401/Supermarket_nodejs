import express from 'express';
import { OrdersController } from './orders.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { restrictTo } from '../../middlewares/role.middleware.js';

const router = express.Router();
const ordersController = new OrdersController();

// Tất cả các route dưới đây đều yêu cầu đăng nhập (Nhân viên)
router.use(protect);

// 1. Lấy danh sách đơn hàng Online
// Quyền: ADMIN, MANAGER, WAREHOUSE (để chuẩn bị hàng), CASHIER (nếu cần check)
router.get('/', restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER'), ordersController.getAll);

// 2. Xem chi tiết đơn hàng
router.get('/:id', restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER'), ordersController.getOne);

// 3. Cập nhật trạng thái đơn hàng (Duyệt, Giao, Hủy)
// Quyền: ADMIN, MANAGER (WAREHOUSE có thể cập nhật trạng thái SHIPPING nếu quy trình cho phép)
router.patch('/:id/status', restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'), ordersController.updateStatus);

export default router;
