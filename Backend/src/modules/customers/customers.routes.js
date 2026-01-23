import express from 'express';
import {CustomersController} from "./customers.controller.js";
import {protectCustomer} from "../../middlewares/customer.middleware.js";
import {protect} from "../../middlewares/auth.middleware.js"; // Middleware cho Staff (User)
import {restrictTo} from "../../middlewares/role.middleware.js";

const customerController = new CustomersController();

// ==========================================
// A. ROUTES CHO STAFF (Cần Token Nhân viên - User)
// Base URL: /api/customers
// ==========================================
const staffRouter = express.Router();

// Middleware check token nhân viên (User) cho các route bên dưới
staffRouter.use(protect);

// 1. Tìm kiếm & Lấy danh sách (Phục vụ POS tìm khách tích điểm)
staffRouter.get('/', customerController.getAll);

// 2. Tạo nhanh khách hàng tại quầy
staffRouter.post('/', customerController.create);

// 3. Xem chi tiết & Lịch sử mua (Của khách bất kỳ)
staffRouter.get('/:id', customerController.getOne);
staffRouter.get('/:id/invoices', customerController.getStaffViewHistory);

// 4. Sửa/Xóa (Chỉ Manager/Admin)
staffRouter.patch('/:id', restrictTo('ADMIN', 'MANAGER', 'CASHIER'), customerController.update);
staffRouter.delete('/:id', restrictTo('ADMIN'), customerController.delete);


// ==========================================
// B. ROUTES CHO KHÁCH HÀNG (Cần Token Customer)
// Base URL: /api/customer
// ==========================================
const publicRouter = express.Router();

publicRouter.use(protectCustomer); // Middleware check token khách hàng

// 1. Xem Profile của mình
publicRouter.get('/profile/me', customerController.getMe);

// 2. Tự sửa thông tin
publicRouter.patch('/profile/me', customerController.updateMe);

// 3. Xem lịch sử mua hàng của mình
publicRouter.get('/profile/history', customerController.getMyHistory);

export { staffRouter as staffCustomerRoutes, publicRouter as publicCustomerRoutes };