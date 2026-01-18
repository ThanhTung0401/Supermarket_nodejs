import express from 'express';
import userAuthController from './user.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { restrictTo } from '../../../middlewares/role.middleware.js';

const router = express.Router();

// Chỉ Admin hoặc Manager mới được tạo nhân viên mới
router.post('/register', userAuthController.register);
router.post('/login', userAuthController.login);
router.post('/logout', userAuthController.logout);

export default router;
