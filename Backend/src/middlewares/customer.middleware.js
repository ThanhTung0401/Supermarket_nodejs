import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

export const protectCustomer = async (req, res, next) => {
  try {
    // 1. Lấy token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Vui lòng đăng nhập để thực hiện chức năng này.'));
    }

    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check khách hàng tồn tại
    const currentCustomer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (!currentCustomer) {
      return next(new ApiError(401, 'Tài khoản khách hàng không còn tồn tại.'));
    }

    // 4. Gán vào req
    req.customer = currentCustomer;
    next();
  } catch (error) {
    next(new ApiError(401, 'Token không hợp lệ hoặc đã hết hạn!'));
  }
};