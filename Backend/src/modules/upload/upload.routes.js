import express from 'express';
import { upload, uploadImage } from './upload.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Upload ảnh (Yêu cầu đăng nhập)
router.post('/', protect, upload.single('image'), uploadImage);

export default router;