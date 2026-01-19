import express from 'express';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { restrictTo } from '../../middlewares/role.middleware.js';

const router = express.Router();
const productsController = new ProductsController();
const categoriesController = new CategoriesController();

// --- Categories Routes ---
router.route('/categories')
    .get(protect, categoriesController.getAll)                                     // Lấy danh sách category (cần đăng nhập)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), categoriesController.create);   // Tạo category (ADMIN, MANAGER)
router.route('/categories/:id')
    .get(protect, categoriesController.getOne);                                    // Lấy chi tiết category và các sản phẩm bên trong

// --- Products Routes ---
router.route('/')
    .get(protect, productsController.getAll)                                       // Lấy danh sách sản phẩm (có filter)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), productsController.create);     // Tạo sản phẩm (ADMIN, MANAGER)

router.get('/barcode/:barcode', protect, productsController.getBarcode);           // Lấy SP theo barcode

router.route('/:id')
    .patch(protect, restrictTo('ADMIN', 'MANAGER'), productsController.update)     // Cập nhật SP
    .delete(protect, restrictTo('ADMIN', 'MANAGER'), productsController.delete);   // Xóa mềm (isActive = false)

export default router;