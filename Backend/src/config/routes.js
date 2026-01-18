// Import Routes
import userAuthRoutes from '../modules/auth/user/user.routes.js';
import customerAuthRoutes from '../modules/auth/customer/customer.routes.js';

/**
 * Setup tất cả các routes của ứng dụng
 * @param {Object} app - Express app instance
 */
export const setupRoutes = (app) => {
    // --- Routes Mounting ---
    app.use('/api/auth/user', userAuthRoutes);
    app.use('/api/auth/customer', customerAuthRoutes);

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