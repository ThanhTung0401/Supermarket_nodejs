import express from 'express';
import { ProductsController } from './products.controller.js';
import { CategoriesController } from './categories.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();
const productsController = new ProductsController();
const categoriesController = new CategoriesController();

// --- Categories Routes ---
router.route('/categories')
    .get(protect, categoriesController.getAll)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), categoriesController.create);

// --- Products Routes ---
router.route('/')
    .get(protect, productsController.getAll)
    .post(protect, restrictTo('ADMIN', 'MANAGER'), productsController.create);

router.get('/barcode/:barcode', protect, productsController.getBarcode);

router.route('/:id')
    .patch(protect, restrictTo('ADMIN', 'MANAGER'), productsController.update)
    .delete(protect, restrictTo('ADMIN', 'MANAGER'), productsController.delete);

export default router;