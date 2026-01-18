import customerAuthService from './customer.service.js';
import { createSendToken } from '../../../utils/jwt.js';

class CustomerAuthController {
    async register(req, res, next) {
        try {
            const newCustomer = await customerAuthService.register(req.body);
            createSendToken(newCustomer, 201, res);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { phone, password } = req.body;
            const customer = await customerAuthService.login(phone, password);
            createSendToken(customer, 200, res);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.cookie('token', '', { expires: new Date(Date.now()), httpOnly: true });
            res.status(200).json({ status: 'success', message: 'Đăng xuất thành công!' });
        } catch (error) {
            next(error);
        }
    }
}

export default new CustomerAuthController();
