import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import ApiError from '../../utils/ApiError.js';

class AuthService {
    async register(data) {
        // 1. Kiểm tra email tồn tại
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) throw new ApiError(400, 'Email này đã được sử dụng!');

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // 3. Tạo user mới
        const newUser = await prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: hashedPassword,
                role: data.role || 'CASHIER', // Mặc định là Thu ngân nếu không chọn
                phone: data.phone
            },
        });

        return newUser;
    }

    async login(email, password) {
        // 1. Kiểm tra input
        if (!email || !password) {
            throw new ApiError(400, 'Vui lòng cung cấp email và mật khẩu!');
        }

        // 2. Tìm user và lấy mật khẩu
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // 3. So sánh mật khẩu
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new ApiError(401, 'Email hoặc mật khẩu không chính xác!');
        }

        // 4. Kiểm tra tài khoản bị khóa
        if (!user.isActive) {
            throw new ApiError(403, 'Tài khoản này đã bị vô hiệu hóa!');
        }

        return user;
    }
}

export default new AuthService();