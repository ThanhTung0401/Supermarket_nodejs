import express from 'express';
import authController from './auth.controller.js';
// Có thể import middleware protect nếu muốn làm chức năng đổi pass/logout

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;