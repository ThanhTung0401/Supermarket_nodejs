import express from 'express';
import * as voucherController from './vouchers.controller.js';
import { protect as authenticate } from '../../middlewares/auth.middleware.js';
import { restrictTo as authorize } from '../../middlewares/role.middleware.js';

const router = express.Router();

// Routes cho Vouchers
// Chỉ Admin và Manager được quản lý vouchers
router.post('/vouchers', authenticate, authorize('ADMIN', 'MANAGER'), voucherController.createVoucher);
router.get('/vouchers', authenticate, authorize('ADMIN', 'MANAGER', 'CASHIER'), voucherController.getAllVouchers);

// Kiểm tra voucher (cho POS hoặc Online)
router.post('/vouchers/verify', authenticate, voucherController.verifyVoucher);

router.get('/vouchers/:id', authenticate, authorize('ADMIN', 'MANAGER'), voucherController.getVoucherById);
router.put('/vouchers/:id', authenticate, authorize('ADMIN', 'MANAGER'), voucherController.updateVoucher);
router.delete('/vouchers/:id', authenticate, authorize('ADMIN', 'MANAGER'), voucherController.deleteVoucher);

export default router;
