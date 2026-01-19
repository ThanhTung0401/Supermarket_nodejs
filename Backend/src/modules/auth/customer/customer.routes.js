import express from 'express';
import customerAuthController from './customer.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { restrictTo } from '../../../middlewares/role.middleware.js';

const router = express.Router();

router.post('/register', customerAuthController.register); // Đăng ký khách hàng
router.post('/login', customerAuthController.login);       // Đăng nhập khách hàng
router.post('/logout', customerAuthController.logout);     // Đăng xuất

export default router;
