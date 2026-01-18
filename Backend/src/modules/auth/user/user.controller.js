import userAuthService from './user.service.js';
import { createSendToken } from '../../../utils/jwt.js';

class UserAuthController {
    async register(req, res, next) {
        try {
            const newUser = await userAuthService.register(req.body);
            createSendToken(newUser, 201, res);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await userAuthService.login(email, password);
            createSendToken(user, 200, res);
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

export default new UserAuthController();
