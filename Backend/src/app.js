import express from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/error.middleware.js';

// Import Routes
import authRoutes from './modules/auth/auth.routes.js';
// Các route khác sẽ import ở đây sau (users, products...)

const app = express();

// --- Middlewares ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Đọc được JSON body

// --- Routes Mounting ---
app.use('/api/auth', authRoutes);

// Route mặc định kiểm tra server
app.get('/', (req, res) => {
    res.send('Supermarket API is running...');
});

// Xử lý route không tồn tại (404)
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Không tìm thấy đường dẫn ${req.originalUrl} trên server này!`
    });
});

// --- Global Error Handler ---
app.use(globalErrorHandler);

export default app;