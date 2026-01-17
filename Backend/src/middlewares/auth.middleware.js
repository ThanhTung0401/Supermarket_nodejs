import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
    try {
        // 1. Lấy token từ header
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new ApiError(401, 'Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.'));
        }

        // 2. Xác thực token (Verify)
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3. Kiểm tra user còn tồn tại không
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!currentUser) {
            return next(new ApiError(401, 'Người dùng thuộc token này không còn tồn tại.'));
        }

        // 4. Gán user vào request để dùng ở các bước sau
        req.user = currentUser;
        next();
    } catch (error) {
        next(new ApiError(401, 'Token không hợp lệ hoặc đã hết hạn!'));
    }
};