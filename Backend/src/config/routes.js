// Import Routes
import authRoutes from '../modules/auth/auth.routes.js';

/**
 * Setup tất cả các routes của ứng dụng
 * @param {Object} app - Express app instance
 */
export const setupRoutes = (app) => {
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
};