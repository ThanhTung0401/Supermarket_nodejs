import express from 'express';
import userAuthController from './user.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { restrictTo } from '../../../middlewares/role.middleware.js';

const router = express.Router();

// Public Routes
router.post('/login', userAuthController.login);

// Protected Routes
router.use(protect); // Các route bên dưới cần đăng nhập

router.post('/logout', userAuthController.logout);

// Chỉ Admin hoặc Manager mới được tạo nhân viên mới
router.post('/register', restrictTo('ADMIN', 'MANAGER'), userAuthController.register);

export default router;