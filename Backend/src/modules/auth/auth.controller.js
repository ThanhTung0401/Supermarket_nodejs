import authService from './auth.service.js';
import { createSendToken } from '../../utils/jwt.js';

class AuthController {
    async register(req, res, next) {
        try {
            const newUser = await authService.register(req.body);
            createSendToken(newUser, 201, res);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await authService.login(email, password);
            createSendToken(user, 200, res);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();