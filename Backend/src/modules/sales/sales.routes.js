import express from 'express';

import {ShiftsController} from "./shift.controller.js";
import {PosController} from "./pos.controller.js";
import {ReturnsController} from "./returns.controller.js";

import {protect} from "../../middlewares/auth.middleware.js"
import {restrictTo} from "../../middlewares/role.middleware.js";

const router = express.Router();

const shiftController = new ShiftsController()
const posController = new PosController()
const returnsController = new ReturnsController()



router.use(protect); // Bắt buộc đăng nhập

// --- 1. CA LÀM VIỆC (SHIFT) ---
router.post('/shift/start', restrictTo('CASHIER', 'MANAGER'), shiftController.starShift);
router.post('/shift/end', restrictTo('CASHIER', 'MANAGER'), shiftController.endShift);
router.get('/shift', restrictTo('CASHIER', 'MANAGER'), shiftController.getAllShift);
router.get('/shift/current', restrictTo('CASHIER', 'MANAGER'), shiftController.getCurrentShift);

// --- 2. BÁN HÀNG (POS) ---
router.post('/checkout', restrictTo('CASHIER', 'MANAGER'), posController.createPOSInvoice);

// --- 3. ĐỔI TRẢ (RETURNS) ---
router.post('/return', restrictTo('MANAGER', 'ADMIN'), returnsController.returnInvoice);

export default router;