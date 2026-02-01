import express from 'express';
import { ReportsController } from './reports.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { restrictTo } from '../../middlewares/role.middleware.js';

const router = express.Router();
const reportsController = new ReportsController();

// Tất cả các route báo cáo đều yêu cầu đăng nhập và quyền quản lý
router.use(protect);
router.use(restrictTo('ADMIN', 'MANAGER'));

// 1. Thống kê tổng quan (Dashboard)
router.get('/dashboard', reportsController.getDashboardStats);

// 2. Biểu đồ doanh thu
router.get('/revenue-chart', reportsController.getRevenueChart);

// 3. Top sản phẩm bán chạy
router.get('/top-selling', reportsController.getTopSelling);

// 4. Sản phẩm sắp hết hàng
router.get('/low-stock', reportsController.getLowStock);

export default router;
