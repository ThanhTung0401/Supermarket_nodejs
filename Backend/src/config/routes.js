// Import Routes
import userAuthRoutes from '../modules/auth/user/user.routes.js';
import customerAuthRoutes from '../modules/auth/customer/customer.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import partnersRoutes from '../modules/partners/partners.routes.js';
import productsRoutes from '../modules/products/products.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import { staffCustomerRoutes } from "../modules/customers/customers.routes.js";
import { publicCustomerRoutes } from "../modules/customers/customers.routes.js";
import marketingRoutes from '../modules/marketing/marketing.routes.js';
import salesRoutes from "../modules/sales/sales.routes.js";

/**
 * Setup tất cả các routes của ứng dụng
 * @param {Object} app - Express app instance
 */
export const setupRoutes = (app) => {
    // --- Routes Mounting ---
    app.use('/api/auth/user', userAuthRoutes);
    app.use('/api/auth/customer', customerAuthRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/partners', partnersRoutes);
    app.use('/api/products', productsRoutes);
    app.use('/api/inventory', inventoryRoutes);
    app.use('/api/customers', staffCustomerRoutes);
    app.use('/api/customer', publicCustomerRoutes);
    app.use('/api/marketing', marketingRoutes);
    app.use('/api/sales', salesRoutes);



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