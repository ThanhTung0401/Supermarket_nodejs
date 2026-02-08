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
    .get(protect, categoriesController.getAll)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), categoriesController.create);

router.route('/categories/:id')
    .get(protect, categoriesController.getOne)
    .patch(protect, restrictTo('ADMIN', 'MANAGER'), categoriesController.update)
    .delete(protect, restrictTo('ADMIN', 'MANAGER'), categoriesController.delete);

// --- Products Routes ---
router.route('/')
    .get(protect, productsController.getAll)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), productsController.create);

router.get('/barcode/:barcode', protect, productsController.getBarcode);

router.patch('/:id/restore', protect, restrictTo('ADMIN', 'MANAGER'), productsController.restore);
router.delete('/:id/hard-delete', protect, restrictTo('ADMIN'), productsController.hardDelete); // Chỉ Admin mới được xóa vĩnh viễn

router.route('/:id')
    .patch(protect, restrictTo('ADMIN', 'MANAGER'), productsController.update)
    .delete(protect, restrictTo('ADMIN', 'MANAGER'), productsController.delete);

export default router;