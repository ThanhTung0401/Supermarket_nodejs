import { SuppliersController } from './suppliers.controller.js';
import express from 'express';
import { protect } from "../../middlewares/auth.middleware.js";
import { restrictTo } from "../../middlewares/role.middleware.js";

const router = express.Router();
const suppliersController = new SuppliersController();

// Tất cả các route dưới đây đều yêu cầu đăng nhập
router.use(protect);

// Chỉ Admin, Manager và Warehouse mới được quản lý nhà cung cấp
router.get('/suppliers', restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'), suppliersController.getAll);
router.get('/supplier/:id', restrictTo('ADMIN', 'MANAGER', 'WAREHOUSE'), suppliersController.getOne);

// Chỉ Admin và Manager mới được tạo/sửa/xóa nhà cung cấp
router.post('/supplier', restrictTo('ADMIN', 'MANAGER'), suppliersController.create);
router.patch('/supplier/:id', restrictTo('ADMIN', 'MANAGER'), suppliersController.update);
router.delete('/supplier/:id', restrictTo('ADMIN'), suppliersController.delete);

export default router;