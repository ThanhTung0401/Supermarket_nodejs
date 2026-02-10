import express from 'express';
import { StoreController } from './store.controller.js';
import { protectCustomer } from '../../middlewares/customer.middleware.js';

const router = express.Router();
const storeController = new StoreController();


// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get('/products', storeController.getProducts);
router.get('/products/:id', storeController.getProductDetail);
router.get('/categories', storeController.getCategories); // API mới

// --- PROTECTED ROUTES (Phải đăng nhập tài khoản Khách hàng) ---
router.use(protectCustomer);

router.post('/orders', storeController.createOrder);
router.get('/orders', storeController.getMyOrders);

export default router;