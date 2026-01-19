import {UsersController} from './users.controller.js';
import express from 'express';
import {protect} from "../../middlewares/auth.middleware.js";
import {restrictTo} from "../../middlewares/role.middleware.js";

const router = express.Router();
const usersController = new UsersController();

// Tất cả các route dưới đây đều yêu cầu đăng nhập
router.use(protect);

// Chỉ Admin và Manager mới xem được danh sách nhân viên
router.get('/', restrictTo('ADMIN', 'MANAGER'), usersController.getAll);           // Lấy danh sách nhân viên (ADMIN, MANAGER) ((có filter))

// Admin toàn quyền sửa/khóa
router.get('/:id', restrictTo('ADMIN', 'MANAGER'), usersController.getOne);        // Lấy chi tiết nhân viên
router.patch('/:id', restrictTo('ADMIN'), usersController.update);                 // Cập nhật nhân viên (ADMIN)
router.patch('/:id/toggle-active', restrictTo('ADMIN'), usersController.toggleActive); // Khóa/Mở khóa nhân viên (ADMIN)
router.delete('/:id', restrictTo('ADMIN'), usersController.delete);                // Xóa nhân viên (ADMIN)


export default router;