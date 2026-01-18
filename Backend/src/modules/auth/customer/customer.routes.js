import express from 'express';
import customerAuthController from './customer.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { restrictTo } from '../../../middlewares/role.middleware.js';

const router = express.Router();

router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);
router.post('/logout', customerAuthController.logout);

export default router;
